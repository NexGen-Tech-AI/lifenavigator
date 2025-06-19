'use client';

import React, { useEffect } from 'react';

export default function TestJS() {
  useEffect(() => {
    console.log('Component mounted - JavaScript is working!');
    alert('JavaScript is working!');
  }, []);

  const handleClick = () => {
    alert('Button clicked!');
    console.log('Button was clicked');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">JavaScript Test Page</h1>
      <button 
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Click me to test JavaScript
      </button>
      <div className="mt-4">
        <p>Open the browser console to see logs.</p>
        <p>If you see an alert, JavaScript is working.</p>
      </div>
    </div>
  );
}