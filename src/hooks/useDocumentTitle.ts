import { useEffect } from "react";

const APP_TITLE = "YCC App";

// Stacking (multiple concurrent instances) is not supported
const useDocumentTitle = (title: string): void => {
  useEffect((): (() => void) => {
    const previousTitle = document.title;
    const trimmed = title.trim();
    document.title = trimmed ? `${trimmed} | ${APP_TITLE}` : APP_TITLE;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default useDocumentTitle;
