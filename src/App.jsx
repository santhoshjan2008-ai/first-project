import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/layout/ErrorBoundary';

const Landing = lazy(() => import('./pages/Landing'));
const Convert = lazy(() => import('./pages/Convert'));
const Library = lazy(() => import('./pages/Library'));
const ModelDetail = lazy(() => import('./pages/ModelDetail'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-primary)] animate-spin" />
        <div
          className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-df-cyan animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/convert" element={<Convert />} />
            <Route path="/library" element={<Library />} />
            <Route path="/model/:id" element={<ModelDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  );
}

