// src/utils/constants.js

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inprogress',
  DONE: 'done'
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';