import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Typography from '@mui/material/Typography';
import React from 'react';
import ReactDOM from 'react-dom/client';

import {auth} from '@app/context/AuthenticationContext';

import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Hack to display something in case loading takes a while
let authFinally = false;
setTimeout(() => {
  if (!authFinally) {
    root.render(<Typography>Authenticating...</Typography>);
  }
}, 2000);

auth.init().finally(() => {
  authFinally = true;
  if (auth.authenticated) {
    if (auth.currentUser.activeMember) {
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } else {
      const message =
        'Sorry, but it seems that you are not an active member of YCC.\n' +
        'Maybe your membership fee for the current year was not recorded yet.\n' +
        `If this is the case, please contact us with your username which is ${auth.currentUser.username}.`;
      alert(message);
      root.render(<Typography>{message}</Typography>);
      auth.logout();
    }
  } else {
    alert('Authentication failed');
    window.location.reload();
  }
});
