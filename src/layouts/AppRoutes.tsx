import { ErrorBoundary } from "react-error-boundary";
import { Route, Routes, useLocation } from "react-router-dom";

import PermissionsPage from "@/pages/admin/PermissionsPage";
import NotFoundPage from "@/pages/error/NotFoundPage";
import EditHelperTaskPage from "@/pages/helpers/task/EditHelperTaskPage";
import HelperTaskPage from "@/pages/helpers/task/HelperTaskPage";
import NewHelperTaskPage from "@/pages/helpers/task/NewHelperTaskPage";
import HelperTasksPage from "@/pages/helpers/tasks/HelperTasksPage";
import HomePage from "@/pages/home/HomePage";
import MemberListPage from "@/pages/members/MembersListPage";
import PlaygroundEditorPage from "@/pages/playground/PlaygroundEditorPage";
import PlaygroundErrorPage from "@/pages/playground/PlaygroundErrorPage";
import PlaygroundStylesPage from "@/pages/playground/PlaygroundStylesPage";

import ErrorFallback from "./ErrorFallback";

const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location.key]}>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/members" element={<MemberListPage />} />
        <Route path="/helpers" element={<HelperTasksPage />} />
        <Route path="/helpers/tasks/new" element={<NewHelperTaskPage />} />
        <Route path="/helpers/tasks/:id" element={<HelperTaskPage />} />
        <Route
          path="/helpers/tasks/:id/edit"
          element={<EditHelperTaskPage />}
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
