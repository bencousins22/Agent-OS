import React, { lazy, Suspense } from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./components/LandingPage'));
const App = lazy(() => import('./App'));

// Loading component for better UX
const PageLoader = () => (
  <div className="fixed inset-0 bg-[#0b0f16] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-[#00e599]/20 border-t-[#00e599] rounded-full animate-spin"></div>
      <div className="text-[#00e599] font-medium">Loading...</div>
    </div>
  </div>
);

const Routes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterRoutes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<App />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes;
