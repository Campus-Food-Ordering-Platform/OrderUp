import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth/callback`,// issue was here it was redirecting to the wrong page, when logged in with google we redirect back to welcome page instead of the callback which checks the database.
      }}//also the issue was i used this syntax '' instead of `` for the redirect uri and it was not working because it was not able to parse the environment variable and the window.location.origin.=
      
      cacheLocation='localstorage'// we did not add this line before and it was causing the user to be logged out when they refresh the page, because the default cache location is memory and it does not persist the session after a page refresh.
      
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);