'use client';

export default function SimpleTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Simple JavaScript Test</h1>
      
      <button 
        onClick={() => {
          console.log('Button clicked!');
          alert('JavaScript is working!');
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Click Me
      </button>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          console.log('Inline script executed');
          window.addEventListener('load', () => {
            console.log('Window loaded');
          });
        `
      }} />
    </div>
  );
}