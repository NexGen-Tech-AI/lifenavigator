'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/cards/Card';
import { Button } from '@/components/ui/buttons/Button';
import { RoadmapSummary, RoadmapType, RoadmapProgress } from '@/types/roadmap';
import { LoadingSpinner } from '@/components/ui/loaders/LoadingSpinner';
import { getUserRoadmaps, getRoadmapProgress } from '@/lib/api/roadmap';

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);
  const [progress, setProgress] = useState<RoadmapProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roadmapsData, progressData] = await Promise.all([
          getUserRoadmaps(),
          getRoadmapProgress()
        ]);
        setRoadmaps(roadmapsData);
        setProgress(progressData);
      } catch (err) {
        console.error('Error fetching roadmap data:', err);
        setError('Failed to load roadmap data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigateToRoadmap = (type: RoadmapType) => {
    router.push(`/dashboard/roadmap/${type}`);
  };

  const getDomainColor = (type: RoadmapType) => {
    switch (type) {
      case 'career':
        return 'bg-blue-500';
      case 'education':
        return 'bg-purple-500';
      case 'finance':
        return 'bg-green-500';
      case 'healthcare':
        return 'bg-red-500';
      case 'comprehensive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateProgressColor = (progressValue: number) => {
    if (progressValue < 25) return 'bg-red-500';
    if (progressValue < 50) return 'bg-orange-500';
    if (progressValue < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="p-6 text-center text-red-500">
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // For demo purposes, if no roadmaps exist yet
  const mockDomains: RoadmapType[] = ['career', 'education', 'finance', 'healthcare', 'comprehensive'];
  const hasRoadmaps = roadmaps.length > 0;

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Life Roadmaps</h1>
        <Button onClick={() => router.push('/dashboard/roadmap/generate')}>
          Create New Roadmap
        </Button>
      </div>

      {/* Overall Progress */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Total Progress</span>
            <span>{progress?.overall || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`${calculateProgressColor(progress?.overall || 0)} h-4 rounded-full`}
              style={{ width: `${progress?.overall || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockDomains.filter(d => d !== 'comprehensive').map((domain) => (
            <div key={domain} className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="capitalize">{domain}</span>
                <span>{progress?.byDomain?.[domain] || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`${calculateProgressColor(progress?.byDomain?.[domain] || 0)} h-3 rounded-full`}
                  style={{ width: `${progress?.byDomain?.[domain] || 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Domain Roadmaps */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Domain Roadmaps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockDomains.map((domain) => {
            const domainRoadmap = roadmaps.find(r => r.type === domain);
            
            return (
              <Card key={domain} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className={`w-4 h-4 rounded-full ${getDomainColor(domain)} mr-2`}></div>
                  <h3 className="text-lg font-medium capitalize">{domain} Roadmap</h3>
                </div>
                
                {domainRoadmap ? (
                  <>
                    <p className="text-gray-600 mb-4">{domainRoadmap.title}</p>
                    <div className="flex items-center mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                        <div 
                          className={`${calculateProgressColor(domainRoadmap.progress)} h-3 rounded-full`}
                          style={{ width: `${domainRoadmap.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{domainRoadmap.progress}%</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>Start: {new Date(domainRoadmap.startDate).toLocaleDateString()}</span>
                      <span>Target: {new Date(domainRoadmap.targetDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm mb-4">
                      <span className="text-green-600 font-medium">{domainRoadmap.completedMilestones}</span> of {domainRoadmap.completedMilestones + domainRoadmap.activeMilestones} milestones completed
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 mb-4">No {domain} roadmap created yet.</p>
                )}
                
                <Button 
                  onClick={() => navigateToRoadmap(domain)}
                  variant={domainRoadmap ? "default" : "outline"}
                  className="w-full"
                >
                  {domainRoadmap ? 'View Details' : 'Create Roadmap'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {progress && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          
          {/* Recently Completed */}
          {progress.recentlyCompleted.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Recently Completed</h3>
              <div className="space-y-2">
                {progress.recentlyCompleted.map((milestone) => (
                  <div key={milestone.id} className="flex items-center p-2 bg-green-50 rounded-md">
                    <div className="bg-green-500 w-3 h-3 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-sm text-gray-600 capitalize">{milestone.domain}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upcoming */}
          {progress.upcoming.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Upcoming Milestones</h3>
              <div className="space-y-2">
                {progress.upcoming.map((milestone) => (
                  <div key={milestone.id} className="flex items-center p-2 bg-blue-50 rounded-md">
                    <div className="bg-blue-500 w-3 h-3 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600 capitalize">{milestone.domain}</p>
                        <p className="text-sm text-gray-600">Due: {new Date(milestone.targetDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Delayed */}
          {progress.delayed.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Delayed Milestones</h3>
              <div className="space-y-2">
                {progress.delayed.map((milestone) => (
                  <div key={milestone.id} className="flex items-center p-2 bg-red-50 rounded-md">
                    <div className="bg-red-500 w-3 h-3 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600 capitalize">{milestone.domain}</p>
                        <p className="text-sm text-red-600">Overdue: {new Date(milestone.targetDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {progress.recentlyCompleted.length === 0 && 
           progress.upcoming.length === 0 && 
           progress.delayed.length === 0 && (
            <p className="text-center text-gray-500 py-8">No recent roadmap activity to display.</p>
          )}
        </Card>
      )}
    </div>
  );
}