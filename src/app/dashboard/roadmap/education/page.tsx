"use client";

import { Suspense } from 'react';
import ComingSoon from '../../../../placeholders/ComingSoon';

export default function EducationRoadmapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComingSoon title="Education Roadmap" description="Your personalized education roadmap is coming soon. Check back later to see your customized learning path and progress tracking." />
    </Suspense>
  );
}