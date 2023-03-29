import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Route, Routes, useLocation} from 'react-router-dom';

import Home from '@app/pages/Home';
import NotFound from '@app/pages/NotFound';
import ProfilePage from '@app/pages/ProfilePage';
import HelperTasks from '@app/pages/helper-tasks/HelperTasks';
import PlaygroundError from '@app/pages/playground/PlaygroundError';
import PlaygroundStyles from '@app/pages/playground/PlaygroundStyles';

import ErrorFallback from './ErrorFallback';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location.key]}>
      <Routes>
        <Route path="*" element={<NotFound />} />

        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/helper-tasks" element={<HelperTasks />} />

        <Route path="/playground/error" element={<PlaygroundError />} />
        <Route path="/playground/styles" element={<PlaygroundStyles />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
