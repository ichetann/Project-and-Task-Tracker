const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================
// HELPER FUNCTION: Check if user can modify task
// ============================================
// ============================================
// HELPER FUNCTION: Check if user can modify task
// ============================================
const canUserModifyTask = async (task, userId) => {
  // Get the project
  const project = await Project.findById(task.project);
  
  if (!project) {
    return { allowed: false, reason: 'Project not found' };
  }

  // User can modify if:
  // 1. User is project owner OR
  // 2. User created this task OR  // ✅ ADDED THIS
  // 3. User is assigned to this task
  const isProjectOwner = project.owner.toString() === userId;
  const isTaskCreator = task.createdBy.toString() === userId;  // ✅ ADDED
  const isAssignedToTask = task.assignedTo && task.assignedTo.some(
    assigneeId => assigneeId.toString() === userId
  );

  if (isProjectOwner || isTaskCreator || isAssignedToTask) {  // ✅ UPDATED
    return { allowed: true, project };
  }

  return { 
    allowed: false, 
    reason: 'Only project owner, task creator, or assigned members can modify this task'  // ✅ UPDATED
  };
};

// ============================================
// GET ALL TASKS
// ============================================
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.query.project) {
      query.project = req.query.project;
    } else {
      const userProjects = await Project.find({
        $or: [
          { owner: req.userId },
          { members: req.userId }
        ]
      }).select('_id');

      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    if (req.query.assignedTo) {
      query.assignedTo = { $in: [req.query.assignedTo] };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// GET SINGLE TASK
// ============================================
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to view (project member)
    const project = await Project.findById(task.project._id);
    
    const hasAccess = 
      project.owner.toString() === req.userId ||
      project.members.some(member => member.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// CREATE TASK
// ============================================
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project required' });
    }

    const projectDoc = await Project.findById(project);
    
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project member
    const hasAccess = projectDoc.owner.toString() === req.userId ||
                      projectDoc.members.some(member => member.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    // Validate all assigned users are members
    if (assignedTo && assignedTo.length > 0) {
      const invalidUsers = assignedTo.filter(userId => 
        !projectDoc.members.some(member => member.toString() === userId)
      );
      
      if (invalidUsers.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot assign to non-members',
          invalidUsers 
        });
      }
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo: assignedTo || [],
      createdBy: req.userId
    });

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// UPDATE TASK - WITH PERMISSION CHECK
// ============================================
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // ✅ CHECK PERMISSION: Only project owner or assigned users can modify
    const permission = await canUserModifyTask(task, req.userId);
    
    if (!permission.allowed) {
      return res.status(403).json({ message: permission.reason });
    }

    const project = permission.project;

    // Validate assigned users if being updated
    if (assignedTo !== undefined) {
      if (assignedTo.length > 0) {
        const invalidUsers = assignedTo.filter(userId => 
          !project.members.some(member => member.toString() === userId)
        );
        
        if (invalidUsers.length > 0) {
          return res.status(400).json({ 
            message: 'Cannot assign to non-members',
            invalidUsers 
          });
        }
      }
      task.assignedTo = assignedTo;
    }

    // Update other fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// DELETE TASK - WITH PERMISSION CHECK
// ============================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);

    // ✅ Only project owner or task creator can delete
    const canDelete = 
      project.owner.toString() === req.userId ||
      task.createdBy.toString() === req.userId;

    if (!canDelete) {
      return res.status(403).json({ 
        message: 'Only project owner or task creator can delete this task' 
      });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// GET TASK STATS
// ============================================
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userProjects = await Project.find({
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    const stats = await Task.aggregate([
      {
        $match: {
          project: { $in: projectIds }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      {
        $match: {
          project: { $in: projectIds }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const myTasks = await Task.countDocuments({
      assignedTo: { $in: [req.userId] }
    });

    res.json({
      byStatus: stats,
      byPriority: priorityStats,
      assignedToMe: myTasks
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// // routes/tasks.js

// const express = require('express');
// const Task = require('../models/Task');
// const Project = require('../models/Project');
// const auth = require('../middleware/auth');

// const router = express.Router();

// // GET ALL TASKS (user's projects)
// // GET /api/tasks?project=xxx&status=xxx&priority=xxx
// router.get('/', auth, async (req, res) => {
//   try {
//     // Build query
//     let query = {};

//     // Filter by project if provided
//     if (req.query.project) {
//       query.project = req.query.project;
//     } else {
//       // Get all projects user has access to
//       const userProjects = await Project.find({
//         $or: [
//           { owner: req.userId },
//           { members: req.userId }
//         ]
//       }).select('_id');

//       const projectIds = userProjects.map(p => p._id);
//       query.project = { $in: projectIds };
//     }

//     // Filter by status if provided
//     if (req.query.status) {
//       query.status = req.query.status;
//     }

//     // Filter by priority if provided
//     if (req.query.priority) {
//       query.priority = req.query.priority;
//     }

//     // Filter by assigned user
//     // if (req.query.assignedTo) {
//     //   query.assignedTo = req.query.assignedTo;
//     // }

//     if (req.query.assignedTo) {
//   query.assignedTo = { $in: [req.query.assignedTo] };  // Array contains
// }

//     const tasks = await Task.find(query)
//       .populate('project', 'name')
//       .populate('assignedTo', 'name email')
//       .populate('createdBy', 'name email')
//       .sort({ createdAt: -1 });

//     res.json(tasks);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // CREATE TASK
// // POST /api/tasks
// router.post('/', auth, async (req, res) => {
//   console.log("creating new task");
  
//   try {
//     const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

//     if (!title || !project) {
//       return res.status(400).json({ message: 'Title and project required' });
//     }

//     // Check if user has access to project
//     const projectDoc = await Project.findById(project);
    
//     if (!projectDoc) {
//       return res.status(404).json({ message: 'Project not found' });
//     }

//     const hasAccess = projectDoc.owner.toString() === req.userId ||
//                       projectDoc.members.includes(req.userId);

//     if (!hasAccess) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     // // If assignedTo provided, check if they're a member
//     // if (assignedTo && !projectDoc.members.includes(assignedTo)) {
//     //   return res.status(400).json({ message: 'Cannot assign to non-member' });
//     // }

//     if (assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0) {
//   const invalidAssignees = assignedTo.filter(
//     userId => !projectDoc.members.some(member => member.toString() === userId)
//   );
  
//   if (invalidAssignees.length > 0) {
//     return res.status(400).json({ 
//       message: 'Cannot assign to non-members. All assignees must be project members.' 
//     });
//   }
// }

//     const task = new Task({
//       title,
//       description,
//       status,
//       priority,
//       dueDate,
//       project,
//       assignedTo: assignedTo || [],
//       createdBy: req.userId
//     });

//     await task.save();
//     await task.populate('project', 'name');
//     await task.populate('assignedTo', 'name email');
//     await task.populate('createdBy', 'name email');

//     res.status(201).json(task);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // UPDATE TASK
// // PUT /api/tasks/:id
// // UPDATE TASK
// router.put('/:id', auth, async (req, res) => {
//   try {
//     const { title, description, status, priority, dueDate, assignedTo } = req.body;

//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     const project = await Project.findById(task.project);
//     const hasAccess = project.owner.toString() === req.userId ||
//                       project.members.some(member => member.toString() === req.userId);

//     if (!hasAccess) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     // ✅ CHANGED: Validate array of assigned users
//     if (assignedTo !== undefined) {
//       if (assignedTo.length > 0) {
//         const invalidUsers = assignedTo.filter(userId => 
//           !project.members.some(member => member.toString() === userId)
//         );
        
//         if (invalidUsers.length > 0) {
//           return res.status(400).json({ 
//             message: 'Cannot assign to non-members',
//             invalidUsers 
//           });
//         }
//       }
//       task.assignedTo = assignedTo;  // ✅ Update with array
//     }

//     if (title) task.title = title;
//     if (description !== undefined) task.description = description;
//     if (status) task.status = status;
//     if (priority) task.priority = priority;
//     if (dueDate !== undefined) task.dueDate = dueDate;

//     await task.save();
//     await task.populate('project', 'name');
//     await task.populate('assignedTo', 'name email');  // ✅ Populates array
//     await task.populate('createdBy', 'name email');

//     res.json(task);
//   } catch (error) {
//     console.error('Update task error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // DELETE TASK
// // DELETE /api/tasks/:id
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Only creator or project owner can delete
//     const project = await Project.findById(task.project);
//     const canDelete = task.createdBy.toString() === req.userId ||
//                       project.owner.toString() === req.userId;

//     if (!canDelete) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     await task.deleteOne();

//     res.json({ message: 'Task deleted' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // GET TASK STATS (for dashboard)
// // GET /api/tasks/stats
// // GET TASK STATS
// router.get('/stats/overview', auth, async (req, res) => {
//   try {
//     const userProjects = await Project.find({
//       $or: [
//         { owner: req.userId },
//         { members: req.userId }
//       ]
//     }).select('_id');

//     const projectIds = userProjects.map(p => p._id);

//     const stats = await Task.aggregate([
//       {
//         $match: {
//           project: { $in: projectIds }
//         }
//       },
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const priorityStats = await Task.aggregate([
//       {
//         $match: {
//           project: { $in: projectIds }
//         }
//       },
//       {
//         $group: {
//           _id: '$priority',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // ✅ CHANGED: Count tasks where user is in assignedTo array
//     const myTasks = await Task.countDocuments({
//       assignedTo: { $in: [req.userId] }
//     });

//     res.json({
//       byStatus: stats,
//       byPriority: priorityStats,
//       assignedToMe: myTasks
//     });
//   } catch (error) {
//     console.error('Stats error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// module.exports = router;