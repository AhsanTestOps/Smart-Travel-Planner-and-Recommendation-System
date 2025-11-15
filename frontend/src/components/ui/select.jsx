import React, { useState } from 'react';

const Select = ({ children, onValueChange, value, ...props }) => {
  return (
    <div className="relative">
      {children}
    </div>
  );
};

const SelectTrigger = ({ className = '', children, ...props }) => (
  <button
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const SelectValue = ({ placeholder }) => {
  return <span className="text-gray-500">{placeholder}</span>;
};

const SelectContent = ({ children }) => (
  <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
    {children}
  </div>
);

const SelectItem = ({ value, children, onSelect }) => (
  <div
    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
    onClick={() => onSelect && onSelect(value)}
  >
    {children}
  </div>
);

// Note: This is a simplified Select component for demonstration
// In a real app, you'd want to use a more robust solution like Radix UI or React Select

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
