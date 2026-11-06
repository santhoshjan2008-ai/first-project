import { Suspense, lazy } from 'react';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import FeatureGrid from '../components/landing/FeatureGrid';
import LimitsNote from '../components/landing/LimitsNote';

const DemoViewer = lazy(() => import('../components/landing/DemoViewer'));

function DemoViewerFallback() {
  return (
    <div className="glass-card-elevated rounded-2xl aspect-video flex items-center justify-center">
      <div className="skeleton w-full h-full rounded-2xl" />
    </div>
  );
}

export default function Landing() {
  return (
    <main>
      <div className="max-w-7xl mx-auto px-4">
        <Hero />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={<DemoViewerFallback />}>
          <DemoViewer />
        </Suspense>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <HowItWorks />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <FeatureGrid />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <LimitsNote />
      </div>
    </main>
  );
}
