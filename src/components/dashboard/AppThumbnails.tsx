'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface AppThumbnail {
  id: string;
  title: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
  link?: string;
  status: 'coming-soon' | 'beta' | 'available';
}

const appThumbnails: AppThumbnail[] = [
  {
    id: 'goals',
    title: 'Goals Achievement',
    description: 'Track and achieve your life goals with smart planning',
    gradient: 'from-indigo-500 to-purple-600',
    icon: (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <defs>
          <linearGradient id="goalsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="1" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path d="M50 80 L100 30 L150 80" fill="none" stroke="white" strokeWidth="3" opacity="0.8"/>
        <path d="M100 30 L100 15" stroke="white" strokeWidth="3" opacity="0.8"/>
        <path d="M100 15 L115 20 L100 25 Z" fill="white" opacity="0.9"/>
        <circle cx="65" cy="65" r="4" fill="white" opacity="0.8"/>
        <circle cx="85" cy="45" r="4" fill="white" opacity="0.8"/>
        <circle cx="100" cy="30" r="6" fill="white"/>
      </svg>
    ),
    status: 'coming-soon'
  },
  {
    id: 'risk-shield',
    title: 'Risk Shield',
    description: 'Smart risk assessment and aversion strategies',
    gradient: 'from-red-500 to-orange-500',
    icon: (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <path d="M100 20 L130 35 L130 60 Q130 80 100 90 Q70 80 70 60 L70 35 Z" 
              fill="none" stroke="white" strokeWidth="3" opacity="0.9"/>
        <path d="M85 50 L95 60 L115 40" fill="none" stroke="white" strokeWidth="4" 
              strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    status: 'coming-soon'
  },
  {
    id: 'smart-budget',
    title: 'Smart Budget',
    description: 'AI-powered budget management and optimization',
    gradient: 'from-green-500 to-emerald-600',
    icon: (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <rect x="70" y="30" width="60" height="40" rx="8" fill="white" opacity="0.3"/>
        <rect x="70" y="35" width="60" height="35" rx="8" fill="white" opacity="0.9"/>
        <text x="100" y="58" fontFamily="Arial" fontSize="20" fontWeight="bold" fill="currentColor" textAnchor="middle" className="fill-green-600">$</text>
        <rect x="30" y="50" width="10" height="20" fill="white" opacity="0.8" rx="2"/>
        <rect x="45" y="40" width="10" height="30" fill="white" opacity="0.8" rx="2"/>
        <rect x="145" y="35" width="10" height="35" fill="white" opacity="0.8" rx="2"/>
        <rect x="160" y="25" width="10" height="45" fill="white" opacity="0.8" rx="2"/>
      </svg>
    ),
    status: 'beta'
  },
  {
    id: 'ai-nutrition',
    title: 'AI Nutrition',
    description: 'Snap, scan, and track calories & macros instantly',
    gradient: 'from-pink-500 to-purple-600',
    icon: (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <rect x="80" y="20" width="40" height="60" rx="8" fill="white" opacity="0.3"/>
        <rect x="85" y="25" width="30" height="50" rx="6" fill="white" opacity="0.9"/>
        <circle cx="100" cy="35" r="5" fill="currentColor" opacity="0.8" className="fill-pink-600"/>
        <rect x="92" y="45" width="16" height="16" fill="currentColor" opacity="0.2" rx="3" className="fill-purple-600"/>
        <rect x="92" y="45" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" rx="3" className="stroke-purple-600"/>
      </svg>
    ),
    status: 'coming-soon'
  },
  {
    id: 'habit-tracker',
    title: 'Habit Builder',
    description: 'Build and maintain life-changing habits',
    gradient: 'from-blue-500 to-cyan-600',
    icon: (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <circle cx="50" cy="50" r="8" fill="white" opacity="0.9"/>
        <circle cx="80" cy="50" r="8" fill="white" opacity="0.9"/>
        <circle cx="110" cy="50" r="8" fill="white" opacity="0.9"/>
        <circle cx="140" cy="50" r="8" fill="white" opacity="0.9"/>
        <path d="M50 50 L80 50 L110 50 L140 50" stroke="white" strokeWidth="2" opacity="0.5"/>
        <path d="M45 45 L50 50 L55 45" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M75 45 L80 50 L85 45" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    status: 'coming-soon'
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness Hub',
    description: 'Meditation, breathing exercises, and mental wellness',
    gradient: 'from-purple-500 to-indigo-600',
    icon: (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <circle cx="100" cy="50" r="30" fill="none" stroke="white" strokeWidth="2" opacity="0.3"/>
        <circle cx="100" cy="50" r="20" fill="none" stroke="white" strokeWidth="2" opacity="0.5"/>
        <circle cx="100" cy="50" r="10" fill="none" stroke="white" strokeWidth="2" opacity="0.7"/>
        <circle cx="100" cy="50" r="5" fill="white" opacity="0.9"/>
      </svg>
    ),
    status: 'coming-soon'
  },
  {
    id: 'sleep-optimizer',
    title: 'Sleep Optimizer',
    description: 'Track and improve your sleep quality',
    gradient: 'from-indigo-600 to-blue-800',
    icon: (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <path d="M100 20 Q120 30 120 50 Q120 70 100 80 Q90 70 90 50 Q90 30 100 20" fill="white" opacity="0.9"/>
        <circle cx="60" cy="30" r="2" fill="white" opacity="0.6"/>
        <circle cx="140" cy="40" r="3" fill="white" opacity="0.7"/>
        <circle cx="130" cy="25" r="2" fill="white" opacity="0.5"/>
        <circle cx="70" cy="60" r="2" fill="white" opacity="0.6"/>
      </svg>
    ),
    status: 'coming-soon'
  },
  {
    id: 'social-connector',
    title: 'Social Connector',
    description: 'Manage relationships and social interactions',
    gradient: 'from-yellow-500 to-orange-600',
    icon: (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <circle cx="100" cy="40" r="12" fill="white" opacity="0.9"/>
        <circle cx="70" cy="60" r="10" fill="white" opacity="0.8"/>
        <circle cx="130" cy="60" r="10" fill="white" opacity="0.8"/>
        <path d="M88 45 L82 55 M112 45 L118 55 M85 60 L115 60" stroke="white" strokeWidth="2" opacity="0.6"/>
      </svg>
    ),
    status: 'coming-soon'
  }
];

export default function AppThumbnails() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group">
      <h2 className="text-xl font-semibold mb-4">Upcoming Features</h2>
      
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {appThumbnails.map((app) => (
          <div
            key={app.id}
            className="flex-none w-64 group/item"
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient}`} />
              
              {/* Icon */}
              <div className="relative h-40 flex items-center justify-center p-8">
                {app.icon}
              </div>
              
              {/* Content */}
              <div className="relative bg-white/10 backdrop-blur-sm p-4">
                <h3 className="text-white font-semibold text-lg mb-1">{app.title}</h3>
                <p className="text-white/80 text-sm mb-2">{app.description}</p>
                
                {/* Status Badge */}
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  app.status === 'available' ? 'bg-green-500/20 text-green-200' :
                  app.status === 'beta' ? 'bg-yellow-500/20 text-yellow-200' :
                  'bg-gray-500/20 text-gray-200'
                }`}>
                  {app.status === 'coming-soon' ? 'Coming Soon' : 
                   app.status === 'beta' ? 'Beta' : 'Available'}
                </span>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium">
                  {app.status === 'coming-soon' ? 'Coming Soon' : 'View Details'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}