// src/components/Common/EmptyState.jsx

import React from 'react';

const EmptyState = ({ 
  icon = '📭', 
  title = 'No data found', 
  description = '', 
  action = null 
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;