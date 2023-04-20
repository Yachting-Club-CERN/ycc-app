import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Route, Routes, useLocation} from 'react-router-dom';

import Home from '@app/pages/Home';
import NotFoundPage from '@app/pages/NotFoundPage';
import ProfilePage from '@app/pages/ProfilePage';
import HelperTaskPage from '@app/pages/helpers/HelperTaskPage';
import HelpersEditTaskPage from '@app/pages/helpers/HelpersEditTaskPage';
import HelpersNewTaskPage from '@app/pages/helpers/HelpersNewTaskPage';
import HelpersPage from '@app/pages/helpers/HelpersPage';
import MembersPage from '@app/pages/members/MembersPage';
import PlaygroundEditorPage from '@app/pages/playground/PlaygroundEditorPage';
import PlaygroundErrorPage from '@app/pages/playground/PlaygroundErrorPage';
import PlaygroundStylesPage from '@app/pages/playground/PlaygroundStylesPage';

import ErrorFallback from './ErrorFallback';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location.key]}>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />

        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/helpers" element={<HelpersPage />} />
        <Route path="/helpers/tasks/new" element={<HelpersNewTaskPage />} />
        <Route path="/helpers/tasks/:id" element={<HelperTaskPage />} />
        <Route
          path="/helpers/tasks/:id/edit"
          element={<HelpersEditTaskPage />}
        />

        <Route path="/playground/editor" element={<PlaygroundEditorPage />} />
        <Route path="/playground/error" element={<PlaygroundErrorPage />} />
        <Route path="/playground/styles" element={<PlaygroundStylesPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
