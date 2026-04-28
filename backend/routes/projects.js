// routes/projects.js

const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes protected with auth middleware

// GET ALL PROJECTS (user is member of)
// GET /api/projects
router.get('/', auth, async (req, res) => {
  try {
    // Find projects where user is owner OR member
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    })
    .populate('owner', 'name email')  // Get owner details
    .populate('members', 'name email')  // Get members details
    .sort({ createdAt: -1 });  // Newest first

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE PROJECT
// POST /api/projects
router.post('/', auth, async (req, res) => {
  console.log("creating project");
  
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name required' });
    }

    const project = new Project({
      name,
      description,
      owner: req.userId,
      members: [req.userId]  // Owner is automatically a member
    });

    await project.save();

    // Populate before sending response
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET SINGLE PROJECT
// GET /api/projects/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access (is owner or member)
    const hasAccess = project.owner._id.toString() === req.userId ||
                      project.members.some(member => member._id.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE PROJECT
// PUT /api/projects/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can update
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can update project' });
    }

    project.name = name || project.name;
    project.description = description || project.description;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ADD MEMBER TO PROJECT
// POST /api/projects/:id/members
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can add members
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    // Find user by email
    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();
    await project.populate('members', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE PROJECT
// DELETE /api/projects/:id
// DELETE PROJECT
// DELETE /api/projects/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only project owner can delete' });
    }

    // Delete all tasks in this project first
    const Task = require('../models/Task');
    const deletedTasks = await Task.deleteMany({ project: req.params.id });

    console.log(`🗑️ Deleted ${deletedTasks.deletedCount} tasks from project ${project.name}`);

    // Delete the project
    await project.deleteOne();

    res.json({ 
      message: 'Project and all associated tasks deleted successfully',
      deletedTasks: deletedTasks.deletedCount
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;