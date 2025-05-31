import React, { useContext, useEffect } from 'react';
import { AppRouter } from './components/AppRouter/AppRouter';
import './styles/App.css';
import { BrowserRouter } from 'react-router-dom';
import { checkToken, UserClaims } from './http/authApi';
import { jwtDecode } from 'jwt-decode';
import mapJwtClaims from './mapJwtClaims';
import { Context } from '.';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

function App() {
  const contextValue = useContext(Context);
  const user = contextValue!.user;

  useEffect(() => {
    checkToken().then((token) => {
      if (token !== null) {
        const decodedToken = jwtDecode(token) as UserClaims;
        user.setUser(mapJwtClaims(decodedToken));
        user.setIsAuth(true);
      }
    }).catch(() => console.error("Error"));
  }, [user]);

  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;