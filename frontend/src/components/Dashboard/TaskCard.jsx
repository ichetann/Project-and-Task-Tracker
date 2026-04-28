import React, { useState } from 'react';
import { tasksAPI } from '../../services/api';
import TaskForm from '../Tasks/TaskForm';
import { useAuth } from '../../context/AuthContext';
import { toast} from 'react-toastify';

const TaskCard = ({ task, onUpdate }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const statusColors = {
    todo: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
    inprogress: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    done: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
  };

  const priorityColors = {
    low: { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
    high: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' }
  };

  // ✅ CHECK PERMISSIONS
  const isProjectOwner = task.project?.owner === user.id;
  const isAssignedToMe = task.assignedTo && task.assignedTo.some(
    assignee => assignee._id === user.id
  );
  const isCreator = task.createdBy?._id === user.id;

  // User can modify if: project owner OR assigned to task
  const canModify = isProjectOwner || isAssignedToMe || isCreator;
  
  // User can delete if: project owner OR task creator
  const canDelete = isProjectOwner || isCreator;

  const handleStatusChange = async (newStatus) => {
    if (!canModify) {
      alert('You do not have permission to modify this task');
      return;
    }

    try {
      await tasksAPI.update(task._id, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      alert('You do not have permission to delete this task');
      return;
    }

    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setIsDeleting(true);
        await tasksAPI.delete(task._id).then(toast.success("Task Deleted Sucessfully"))
        onUpdate();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert(error.response?.data?.message || 'Failed to delete task');
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    if (!canModify) {
      alert('You do not have permission to edit this task');
      return;
    }
    setShowEditForm(true);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-5 border-l-4 ${statusColors[task.status].border} ${isDeleting ? 'opacity-50' : ''}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2 line-clamp-2">
            {task.title}
          </h3>
          <div className="flex gap-1">
            {/* ✅ Only show edit if user can modify */}
            {canModify && (
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                title="Edit task"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {/* ✅ Only show delete if user can delete */}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
                title="Delete task"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            {/* ✅ Show lock icon if no permissions */}
            {!canModify && !canDelete && (
              <span className="text-gray-300 p-1" title="View only - You cannot modify this task">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {task.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status].bg} ${statusColors[task.status].text}`}>
            {task.status === 'inprogress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text} flex items-center gap-1`}>
            <span>{priorityColors[task.priority].icon}</span>
            {task.priority}
          </span>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {task.project && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="truncate">{task.project.name}</span>
            </div>
          )}
          
          {/* Assigned Users */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="flex-1">
                {task.assignedTo.length === 1 ? (
                  <span className="truncate">
                    {task.assignedTo[0].name}
                    {task.assignedTo[0]._id === user.id && (
                      <span className="ml-1 text-indigo-600 font-medium">(You)</span>
                    )}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {task.assignedTo.slice(0, 2).map((assignee) => (
                      <span 
                        key={assignee._id} 
                        className={`text-xs px-2 py-0.5 rounded ${
                          assignee._id === user.id 
                            ? 'bg-indigo-100 text-indigo-700 font-medium' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {assignee.name}
                        {assignee._id === user.id && ' (You)'}
                      </span>
                    ))}
                    {task.assignedTo.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        +{task.assignedTo.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {task.dueDate && (
            <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {isOverdue && '⚠️ '}
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {task.status !== 'done' && canModify && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => handleStatusChange(task.status === 'todo' ? 'inprogress' : 'done')}
              className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 text-sm font-medium py-2 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all"
            >
              {task.status === 'todo' ? '🚀 Start Task' : '✅ Mark Complete'}
            </button>
          </div>
        )}

        {/* View Only Badge */}
        {!canModify && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500 py-2 bg-gray-50 rounded">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Only - Not assigned to you
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <TaskForm
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            onUpdate();
          }}
          initialData={task}
        />
      )}
    </>
  );
};

export default TaskCard;