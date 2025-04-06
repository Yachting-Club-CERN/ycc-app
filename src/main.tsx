import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Typography from "@mui/material/Typography";
import React from "react";
import ReactDOM from "react-dom/client";

import { auth } from "@/context/auth/AuthenticationContext";

import App from "./App";

if (window.location.pathname === "/silent-check-sso") {
  // Normally one would use a public silent-check-sso.html file, but:
  // - This application is served by serve for simplicity
  // - Serve in SPA mode automatically redirects *.html requests to * before checking whether the static files exists
  // - Serve without SPA mode cause other troubles in the past
  //
  // If further issues arise with serve, switch to Nginx
  // TODO if this works, remove silent-check-sso.html
  console.debug("[main] Silent check SSO");
  window.parent.postMessage(window.location.href, window.location.origin);
} else {
  console.info("[main] Starting YCC App...");

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
  );

  const removeSplashScreen = () => {
    console.debug("[main] Removing splash screen...");

    const splashScreen = document.getElementById("splash-screen");
    const splashLogo = document.getElementById("splash-logo");

    if (!splashScreen) {
      console.warn("[main] No splash screen found");
    }
    if (!splashLogo) {
      console.warn("[main] No splash logo found");
    }

    splashScreen?.addEventListener("animationend", () => {
      splashScreen?.remove();
      console.debug("[main] Splash screen removed");
    });
    setTimeout(() => {
      splashScreen?.remove();
      console.debug("[main] Splash screen removed (timeout)");
    }, 1000);

    splashScreen?.classList.add("splash-screen-fade-out");
    splashLogo?.classList.add("splash-logo-fade-out");
  };

  void auth.init().finally(() => {
    console.debug("[main] Authentication initialized");

    removeSplashScreen();

    if (auth.authenticated) {
      if (auth.currentUser.activeMember) {
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>,
        );
      } else {
        const message =
          "Sorry, but it seems that you are not an active member of YCC.\n" +
          "Maybe your membership fee for the current year was not recorded yet.\n" +
          `If this is the case, please contact us with your username which is ${auth.currentUser.username}.`;
        alert(message);
        root.render(<Typography>{message}</Typography>);
        void auth.logout();
      }
    } else {
      alert("Authentication failed");
      window.location.reload();
    }
  });
}
