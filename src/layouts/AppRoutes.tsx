import { ErrorBoundary } from "react-error-boundary";
import { Route, Routes, useLocation } from "react-router-dom";

import PermissionsPage from "@/pages/admin/PermissionsPage";
import HelpersEditTaskPage from "@/pages/helpers/HelpersEditTaskPage";
import HelpersNewTaskPage from "@/pages/helpers/HelpersNewTaskPage";
import HelpersPage from "@/pages/helpers/HelpersPage";
import HelperTaskPage from "@/pages/helpers/HelperTaskPage";
import Home from "@/pages/Home";
import MembersPage from "@/pages/members/MembersPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PlaygroundEditorPage from "@/pages/playground/PlaygroundEditorPage";
import PlaygroundErrorPage from "@/pages/playground/PlaygroundErrorPage";
import PlaygroundStylesPage from "@/pages/playground/PlaygroundStylesPage";
import ProfilePage from "@/pages/ProfilePage";

import ErrorFallback from "./ErrorFallback";

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

        <Route path="/admin/permissions" element={<PermissionsPage />} />

        <Route path="/playground/editor" element={<PlaygroundEditorPage />} />
        <Route path="/playground/error" element={<PlaygroundErrorPage />} />
        <Route path="/playground/styles" element={<PlaygroundStylesPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
