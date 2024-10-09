import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import {Auth0Provider} from '@auth0/auth0-react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-4b8ahp2zxggh7fuk.us.auth0.com"
      clientId="6T8Zb26xsTW9M5LRFbvexkPNl5qLNx8o"
      redirectUri={window.location.origin}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

const serverCall = (ext) => {
  let link = 'http://localhost:8080/';
  if (typeof ext === 'string') {
    link = link.concat(ext);
  }
  
  axios.get(link).then((data) => {
    console.log(data)
    root.render(data);
  })
}

export default serverCall

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
