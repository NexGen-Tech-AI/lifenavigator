'use client';

export default function TestButton() {
  return (
    <div className="p-8">
      <h1>Button Click Test</h1>
      
      <button 
        onClick={() => {
          console.log('Button clicked!');
          alert('Button clicked!');
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Test Button
      </button>
      
      <div className="mt-4">
        <p>If clicking the button shows an alert, JavaScript is working.</p>
      </div>
    </div>
  );
}