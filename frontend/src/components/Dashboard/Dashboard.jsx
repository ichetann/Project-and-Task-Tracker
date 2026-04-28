// src/components/Dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { tasksAPI, projectsAPI } from '../../services/api';
import TaskCard from './TaskCard';
import TaskForm from '../Tasks/TaskForm';
import Stats from './Stats';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    project: '',
    assignedTo: ''  // ✅ NEW: For "My Tasks" filter
  });

  const { user } = useAuth();

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks with filters
      const tasksRes = await tasksAPI.getAll(filter);
      setTasks(tasksRes.data);

      // Fetch projects
      const projectsRes = await projectsAPI.getAll();
      setProjects(projectsRes.data);

      // Fetch stats
      const statsRes = await tasksAPI.getStats();
      setStats(statsRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilter({
      status: '',
      priority: '',
      project: '',
      assignedTo: ''
    });
  };

  // ✅ NEW: Toggle "My Tasks" filter
  const toggleMyTasksFilter = () => {
    if (filter.assignedTo === user.id) {
      // Turn off "My Tasks" filter
      setFilter(prev => ({ ...prev, assignedTo: '' }));
    } else {
      // Turn on "My Tasks" filter
      setFilter(prev => ({ ...prev, assignedTo: user.id }));
    }
  };

  const isMyTasksActive = filter.assignedTo === user.id;
  const hasActiveFilters = filter.status || filter.priority || filter.project || filter.assignedTo;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {isMyTasksActive 
              ? `Showing tasks assigned to you (${tasks.length})`
              : `Welcome back! Here's your task overview`
            }
          </p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </button>
      </div>

      {/* Stats Section */}
      <Stats stats={stats} />

      {/* ✅ NEW: Quick Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={toggleMyTasksFilter}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            isMyTasksActive
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Tasks
          {isMyTasksActive && stats?.assignedToMe > 0 && (
            <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {stats.assignedToMe}
            </span>
          )}
        </button>

        <button
          onClick={() => handleFilterChange('status', filter.status === 'todo' ? '' : 'todo')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter.status === 'todo'
              ? 'bg-gray-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          }`}
        >
          📋 To Do
        </button>

        <button
          onClick={() => handleFilterChange('status', filter.status === 'inprogress' ? '' : 'inprogress')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter.status === 'inprogress'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
          }`}
        >
          🚀 In Progress
        </button>

        <button
          onClick={() => handleFilterChange('status', filter.status === 'done' ? '' : 'done')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter.status === 'done'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
          }`}
        >
          ✅ Done
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All Filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
          {hasActiveFilters && (
            <span className="text-sm text-indigo-600 font-medium">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} found
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="todo">📋 To Do</option>
              <option value="inprogress">🚀 In Progress</option>
              <option value="done">✅ Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filter.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={filter.project}
              onChange={(e) => handleFilterChange('project', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isMyTasksActive ? 'My Tasks' : 'Your Tasks'} 
            {tasks.length > 0 && ` (${tasks.length})`}
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-6xl mb-4">
              {isMyTasksActive ? '📭' : '📋'}
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {isMyTasksActive ? 'No tasks assigned to you' : 'No tasks found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters or create a new task'
                : isMyTasksActive
                  ? 'Tasks assigned to you will appear here'
                  : 'Create your first task to get started!'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onUpdate={fetchData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            fetchData();
            setShowTaskForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

// // src/components/Dashboard/Dashboard.jsx

// import React, { useState, useEffect } from 'react';
// import { tasksAPI, projectsAPI } from '../../services/api';
// import TaskCard from './TaskCard';
// import TaskForm from '../Tasks/TaskForm';
// import Stats from './Stats';

// const Dashboard = () => {
//   const [tasks, setTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showTaskForm, setShowTaskForm] = useState(false);
//   const [filter, setFilter] = useState({
//     status: '',
//     priority: '',
//     project: ''
//   });

//   // Fetch data on mount
//   useEffect(() => {
//     fetchData();
//   }, [filter]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch tasks with filters
//       const tasksRes = await tasksAPI.getAll(filter);
//       setTasks(tasksRes.data);

//       // Fetch projects
//       const projectsRes = await projectsAPI.getAll();
//       setProjects(projectsRes.data);

//       // Fetch stats
//       const statsRes = await tasksAPI.getStats();
//       setStats(statsRes.data);

//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setLoading(false);
//     }
//   };

//   const handleFilterChange = (key, value) => {
//     setFilter(prev => ({
//       ...prev,
//       [key]: value
//     }));
//   };

//   const clearFilters = () => {
//     setFilter({
//       status: '',
//       priority: '',
//       project: ''
//     });
//   };

//   // if (loading) {
//   //   return (
//   //     <div className="flex items-center justify-center h-screen">
//   //       <div className="text-center">
//   //         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
//   //         <p className="text-gray-600">Loading your dashboard...</p>
//   //       </div>
//   //     </div>
//   //   );
//   // }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }
//   return (
//     <div className="max-w-7xl mx-auto">
//       {/* Header with Create Button */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//           <p className="text-gray-600 mt-1">Welcome back! Here's your task overview</p>
//         </div>
//         <button
//           onClick={() => setShowTaskForm(true)}
//           className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           Create Task
//         </button>
//       </div>

//       {/* Stats Section */}
//       <Stats stats={stats} />

//       {/* Filters */}
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
//           {(filter.status || filter.priority || filter.project) && (
//             <button
//               onClick={clearFilters}
//               className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
//             >
//               Clear all
//             </button>
//           )}
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Status Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//             <select
//               value={filter.status}
//               onChange={(e) => handleFilterChange('status', e.target.value)}
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             >
//               <option value="">All Status</option>
//               <option value="todo">To Do</option>
//               <option value="inprogress">In Progress</option>
//               <option value="done">Done</option>
//             </select>
//           </div>

//           {/* Priority Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
//             <select
//               value={filter.priority}
//               onChange={(e) => handleFilterChange('priority', e.target.value)}
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             >
//               <option value="">All Priority</option>
//               <option value="low">Low</option>
//               <option value="medium">Medium</option>
//               <option value="high">High</option>
//             </select>
//           </div>

//           {/* Project Filter */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
//             <select
//               value={filter.project}
//               onChange={(e) => handleFilterChange('project', e.target.value)}
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//             >
//               <option value="">All Projects</option>
//               {projects.map(project => (
//                 <option key={project._id} value={project._id}>
//                   {project.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Tasks Grid */}
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-semibold text-gray-900">
//             Your Tasks {tasks.length > 0 && `(${tasks.length})`}
//           </h2>
//         </div>

//         {tasks.length === 0 ? (
//           <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
//             <div className="text-6xl mb-4">📋</div>
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
//             <p className="text-gray-500 mb-6">
//               {filter.status || filter.priority || filter.project
//                 ? 'Try adjusting your filters'
//                 : 'Create your first task to get started!'}
//             </p>
//             <button
//               onClick={() => setShowTaskForm(true)}
//               className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//               </svg>
//               Create Your First Task
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {tasks.map(task => (
//               <TaskCard 
//                 key={task._id} 
//                 task={task} 
//                 onUpdate={fetchData}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Task Form Modal */}
//       {showTaskForm && (
//         <TaskForm
//           onClose={() => setShowTaskForm(false)}
//           onSuccess={() => {
//             fetchData();
//             setShowTaskForm(false);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;