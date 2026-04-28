import React, { useState, useEffect } from 'react';
import { tasksAPI, projectsAPI } from '../../services/api';
import { toast} from 'react-toastify';


const TaskForm = ({ onClose, onSuccess, initialData = null, defaultProject = '' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    project: defaultProject || '',
    assignedTo: []  // ✅ CHANGED: Array instead of single value
  });
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.project) {
      fetchProjectMembers(formData.project);
    } else {
      setMembers([]);
    }
  }, [formData.project]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        status: initialData.status,
        priority: initialData.priority,
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        project: initialData.project._id,
        // ✅ CHANGED: Handle array of assigned users
        assignedTo: initialData.assignedTo ? initialData.assignedTo.map(u => u._id) : []
      });
    }
  }, [initialData]);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
      
      if (response.data.length === 0) {
        setError('You need to create a project first before creating tasks');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      const response = await projectsAPI.getOne(projectId);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'project') {
      setFormData(prev => ({ ...prev, assignedTo: [] }));  // ✅ Clear array
    }
  };

  // ✅ NEW: Handle multi-select for assigned users
  const handleAssignedToChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      assignedTo: selectedOptions
    }));
  };

  // ✅ NEW: Toggle individual user assignment
  const toggleAssignee = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)  // Remove
        : [...prev.assignedTo, userId]  // Add
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title.trim()) {
      setError('Task title is required');
      setLoading(false);
      return;
    }

    if (!formData.project) {
      setError('Please select a project');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        dueDate: formData.dueDate || null,
        assignedTo: formData.assignedTo  // ✅ Send as array
      };

      if (initialData) {
        await tasksAPI.update(initialData._id, submitData).then(toast.success("Task Updated Sucessfully"))
      } else {
        await tasksAPI.create(submitData).then(toast.success("Task Created Sucessfully"))
      }
      
      onSuccess();
      onClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {initialData ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {projects.length === 0 && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p className="font-medium">No projects found</p>
              <p className="text-sm">Please create a project first before adding tasks.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Design landing page"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Add more details about this task..."
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="todo">📋 To Do</option>
                  <option value="inprogress">🚀 In Progress</option>
                  <option value="done">✅ Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* ✅ NEW: Multi-select Assign To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To (Multiple) - {formData.assignedTo.length} selected
              </label>
              
              {!formData.project ? (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
                  Select a project first to assign members
                </p>
              ) : members.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
                  No members in this project
                </p>
              ) : (
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                  <div className="space-y-2">
                    {members.map(member => (
                      <label
                        key={member._id}
                        className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedTo.includes(member._id)}
                          onChange={() => toggleAssignee(member._id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="ml-3 flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.assignedTo.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.assignedTo.map(userId => {
                    const member = members.find(m => m._id === userId);
                    return member ? (
                      <span
                        key={userId}
                        className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                      >
                        {member.name}
                        <button
                          type="button"
                          onClick={() => toggleAssignee(userId)}
                          className="ml-1 text-indigo-500 hover:text-indigo-700"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || projects.length === 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  initialData ? 'Update Task' : 'Create Task'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;