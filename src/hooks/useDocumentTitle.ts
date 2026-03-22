import { useEffect } from "react";

const APP_TITLE = "YCC App";

const useDocumentTitle = (title: string): void => {
  useEffect((): (() => void) => {
    const previousTitle = document.title;
    document.title = `${title} | ${APP_TITLE}`;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default useDocumentTitle;
