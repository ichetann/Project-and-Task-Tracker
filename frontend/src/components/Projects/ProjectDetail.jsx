// src/components/Projects/ProjectDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../../services/api';
import TaskCard from '../Dashboard/TaskCard';
import TaskForm from '../Tasks/TaskForm';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        projectsAPI.getOne(id),
        tasksAPI.getAll({ project: id })
      ]);
      
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      alert('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    inprogress: tasks.filter(t => t.status === 'inprogress'),
    done: tasks.filter(t => t.status === 'done')
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mb-4">{project.description}</p>
            )}
            
            <div className="flex gap-4 text-sm text-gray-600">
              <span>👥 {project.members.length} members</span>
              <span>📋 {tasks.length} tasks</span>
              <span>✅ {tasksByStatus.done.length} completed</span>
            </div>
          </div>

          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div>
          <div className="bg-gray-100 rounded-lg p-4 mb-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
              To Do ({tasksByStatus.todo.length})
            </h3>
          </div>
          <div className="space-y-3">
            {tasksByStatus.todo.map(task => (
              <TaskCard key={task._id} task={task} onUpdate={fetchProjectDetails} />
            ))}
            {tasksByStatus.todo.length === 0 && (
              <div className="text-center text-gray-400 py-8">No tasks</div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div>
          <div className="bg-blue-100 rounded-lg p-4 mb-3">
            <h3 className="font-semibold text-blue-700 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              In Progress ({tasksByStatus.inprogress.length})
            </h3>
          </div>
          <div className="space-y-3">
            {tasksByStatus.inprogress.map(task => (
              <TaskCard key={task._id} task={task} onUpdate={fetchProjectDetails} />
            ))}
            {tasksByStatus.inprogress.length === 0 && (
              <div className="text-center text-gray-400 py-8">No tasks</div>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div>
          <div className="bg-green-100 rounded-lg p-4 mb-3">
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Done ({tasksByStatus.done.length})
            </h3>
          </div>
          <div className="space-y-3">
            {tasksByStatus.done.map(task => (
              <TaskCard key={task._id} task={task} onUpdate={fetchProjectDetails} />
            ))}
            {tasksByStatus.done.length === 0 && (
              <div className="text-center text-gray-400 py-8">No tasks</div>
            )}
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSuccess={fetchProjectDetails}
          defaultProject={id}
        />
      )}
    </div>
  );
};

export default ProjectDetail;