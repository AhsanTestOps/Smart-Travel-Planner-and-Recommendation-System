import React from 'react';

const Badge = ({ 
  className = '', 
  variant = 'default', 
  children, 
  ...props 
}) => {
  const variants = {
    default: 'bg-primary-600 text-white',
    secondary: 'bg-gray-100 text-gray-900',
    destructive: 'bg-red-600 text-white',
    outline: 'border border-gray-300 bg-white text-gray-900'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
