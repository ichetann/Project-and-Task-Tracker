// src/components/Dashboard/Stats.jsx

import React from 'react';

const Stats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate totals
  const totalTasks = stats.byStatus?.reduce((sum, item) => sum + item.count, 0) || 0;
  
  const todoCount = stats.byStatus?.find(s => s._id === 'todo')?.count || 0;
  const inProgressCount = stats.byStatus?.find(s => s._id === 'inprogress')?.count || 0;
  const doneCount = stats.byStatus?.find(s => s._id === 'done')?.count || 0;

  const statsData = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: '📋',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'To Do',
      value: todoCount,
      icon: '⏳',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      iconBg: 'bg-gray-100'
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      icon: '🚀',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    {
      title: 'Completed',
      value: doneCount,
      icon: '✅',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} p-6 rounded-lg shadow-sm border border-gray-100`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`${stat.iconBg} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
          
          {/* Progress bar for completed tasks */}
          {stat.title === 'Completed' && totalTasks > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round((doneCount / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(doneCount / totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Priority Breakdown */}
      {stats.byPriority && stats.byPriority.length > 0 && (
        <div className="col-span-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Priority Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {['high', 'medium', 'low'].map((priority) => {
              const count = stats.byPriority.find(p => p._id === priority)?.count || 0;
              const colors = {
                high: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
                medium: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
                low: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' }
              };
              
              return (
                <div key={priority} className={`${colors[priority].bg} ${colors[priority].border} border p-4 rounded-lg`}>
                  <p className="text-sm font-medium text-gray-600 capitalize">{priority}</p>
                  <p className={`text-2xl font-bold ${colors[priority].text}`}>{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;