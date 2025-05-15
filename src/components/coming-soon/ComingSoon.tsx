import React from 'react';

export default function ComingSoon({ title = "Coming Soon", description = "This feature is coming soon." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
