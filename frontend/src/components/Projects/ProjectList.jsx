// src/components/Projects/ProjectList.jsx

import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../services/api';
import ProjectForm from './ProjectForm';
import AddMemberModal from './AddMemberModal';
import { useAuth } from '../../context/AuthContext';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This will delete all tasks in this project.`)) {
      try {
        await projectsAPI.delete(projectId).then(toast.success("Project Deleted Sucessfully"))
        fetchProjects();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleAddMembers = (project) => {
    setSelectedProject(project);
    setShowMemberModal(true);
  };

  const handleMemberModalClose = () => {
    setShowMemberModal(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and teams</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Create your first project to organize your tasks</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const isOwner = project.owner._id === user.id;
            
            return (
              <div
                key={project._id}
                // ❌ REMOVED: overflow-hidden (this was hiding the button!)
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
              >
                {/* Project Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.name}
                        </h3>
                        {isOwner && (
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                            Owner
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Members Section */}
                <div className="p-6 bg-gray-50">
                  {/* ✅ FIXED: Better spacing and alignment */}
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      👥 {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                    </p>
                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent any parent click handlers
                          handleAddMembers(project);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                        title="Add a team member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Member
                      </button>
                    )}
                  </div>
                  
                  {/* Member avatars */}
                  <div className="flex flex-wrap gap-2">
                    {project.members.slice(0, 4).map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 text-sm"
                        title={member.email}
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700 text-xs truncate max-w-[100px]">
                          {member.name}
                        </span>
                      </div>
                    ))}
                    {project.members.length > 4 && (
                      <div className="flex items-center px-3 py-1.5 bg-gray-200 rounded-full text-xs text-gray-600 font-medium">
                        +{project.members.length - 4} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Date */}
                <div className="px-6 py-3 bg-white border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Created {new Date(project.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-white border-t border-gray-100">
                  {isOwner ? (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                        className="flex-1 bg-indigo-50 text-indigo-600 py-2.5 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project._id, project.name);
                        }}
                        className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-500 py-2">
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Team Member
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <ProjectForm
          onClose={handleFormClose}
          onSuccess={() => {
            fetchProjects();
            handleFormClose();
          }}
          initialData={editingProject}
        />
      )}

      {/* Add Member Modal */}
      {showMemberModal && selectedProject && (
        <AddMemberModal
          project={selectedProject}
          onClose={handleMemberModalClose}
          onSuccess={() => {
            fetchProjects();
            handleMemberModalClose();
          }}
        />
      )}
    </div>
  );
};

export default ProjectList;