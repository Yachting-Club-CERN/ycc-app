import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto-mono/300.css";
import "@fontsource/roboto-mono/400.css";
import "@fontsource/roboto-mono/500.css";
import "@fontsource/roboto-mono/700.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { auth } from "@/context/auth/AuthenticationContext";

import App from "./App";

if (window.location.pathname === "/silent-check-sso") {
  // Normally one would use a public silent-check-sso.html file, but:
  // - This application is served by serve for simplicity
  // - Serve in SPA mode automatically redirects *.html requests to * before checking whether the static files exists
  // - Serve without SPA mode caused other troubles in the past
  //
  // If further issues arise with serve, switch to Nginx
  console.debug("[main] Silent check SSO");
  window.parent.postMessage(window.location.href, window.location.origin);
} else {
  console.info("[main] Starting YCC App...");

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
  );

  void auth.init().finally(() => {
    console.debug("[main] Authentication initialized");

    if (auth.authenticated) {
      if (auth.currentUser.activeMember) {
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>,
        );
      } else {
        alert(
          "Sorry, but it seems that you are not an active member of YCC.\n" +
            "Maybe your membership fee for the current year was not recorded yet.\n" +
            `If this is the case, please contact us with your username which is ${auth.currentUser.username}.`,
        );
        void auth.logout();
      }
    } else {
      alert("Authentication failed");
      window.location.reload();
    }
  });
}
