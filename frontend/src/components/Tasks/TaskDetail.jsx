// src/components/Tasks/TaskDetail.jsx

import React from 'react';

const TaskDetail = ({ task, onClose, onEdit }) => {
  if (!task) return null;

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    inprogress: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status & Priority */}
          <div className="flex gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
              {task.status.replace('inprogress', 'In Progress')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}>
              {task.priority} priority
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Project</h3>
              <p className="text-gray-600">{task.project?.name}</p>
            </div>

            {task.assignedTo && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Assigned To</h3>
                <p className="text-gray-600">{task.assignedTo.name} ({task.assignedTo.email})</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Created By</h3>
              <p className="text-gray-600">{task.createdBy?.name}</p>
            </div>

            {task.dueDate && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Due Date</h3>
                <p className="text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Created</h3>
              <p className="text-gray-600">{new Date(task.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => onEdit(task)}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
            >
              Edit Task
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>

          // Add this section to show who can edit
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🔐 Task Permissions</h4>
              <p className="text-sm text-blue-700">
                This task can be modified by:
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside mt-2">
                <li>Project Owner</li>
                {task.assignedTo.map(user => (
                  <li key={user._id}>{user.name} (Assigned)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;