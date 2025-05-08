'use client';

import React from 'react';

interface QuestionnaireIntroProps {
  onContinue: () => void;
}

export default function QuestionnaireIntro({ onContinue }: QuestionnaireIntroProps) {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Life Navigator</h2>
      
      <p className="text-xl text-gray-600 dark:text-gray-300">
        Let's create your personalized life roadmap
      </p>
      
      <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg text-left">
        <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">
          What to expect:
        </h3>
        
        <ul className="space-y-3 text-gray-600 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">✓</span>
            <span>A series of questions about your goals in various life domains</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">✓</span>
            <span>Assessment of your risk preferences to better tailor recommendations</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">✓</span>
            <span>The creation of a personalized dashboard with actionable insights</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">✓</span>
            <span>All your information is kept private and secure</span>
          </li>
        </ul>
      </div>
      
      <div className="space-y-3 text-gray-600 dark:text-gray-300">
        <p>
          This questionnaire will take approximately 10-15 minutes to complete.
        </p>
        <p>
          Your responses will help us create customized roadmaps and recommendations for your education, career, financial health, and personal well-being.
        </p>
      </div>
      
      <div className="pt-6">
        <button
          onClick={onContinue}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Let's Get Started
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}