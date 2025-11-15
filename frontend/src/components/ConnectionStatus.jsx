import React, { useState, useEffect } from 'react';
import { config } from '../utils/api';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [backendStatus, setBackendStatus] = useState('unknown');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Test backend connectivity
      const response = await fetch(`${config.BACKEND_URL}/admin/`, {
        method: 'HEAD', // Use HEAD to avoid loading the full admin page
      });
      
      if (response.ok || response.status === 302 || response.status === 401) {
        setBackendStatus('connected');
        setStatus('connected');
      } else {
        setBackendStatus('error');
        setStatus('error');
      }
    } catch (error) {
      setBackendStatus('disconnected');
      setStatus('disconnected');
      console.error('Backend connection error:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'error': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '● Connected';
      case 'error': return '● Warning';
      case 'disconnected': return '● Disconnected';
      default: return '● Checking...';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 border z-50">
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium text-gray-700">Backend:</div>
        <div className={`text-sm font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        <button
          onClick={checkConnection}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          title="Refresh connection status"
        >
          ↻
        </button>
      </div>
      {status !== 'connected' && (
        <div className="text-xs text-gray-500 mt-1">
          Check if Django server is running on {config.BACKEND_URL}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
