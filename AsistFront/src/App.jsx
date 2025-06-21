import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Menu from './Menu';
import ProtectedRoute from '../src/utils/ProtectedRoute.jsx';
import CambiarContrasena from './CambiarContrasena.jsx';
import Perfil from './Perfil.jsx';
import { UsuarioApp } from './components/UsuarioApp.jsx';
import { AuditoriaApp } from './components/AuditoriaApp.jsx';
import { RolApp } from './components/RolApp.jsx';
import { TurnoApp } from './components/TurnoApp.jsx';
import { FuncionarioApp } from './components/FuncionarioApp.jsx';
import { Error } from './Error.jsx';
import Configuracion from './Configuracion.jsx';
import Tema from './Tema.jsx';
import { getConfig } from "./services/config.service";

function App() {
  const UrlBase = '/asist';
  const UrlLocal = UrlBase + '/home';

  // App.js - Modificar getUsuarioFromSession
  const getUsuarioFromSession = () => {
    // Priorizar sessionStorage
    const sessionUser = sessionStorage.getItem('usuario');
    if (sessionUser) return JSON.parse(sessionUser);

    // Si no hay en sessionStorage, verificar localStorage
    const persistentSession = localStorage.getItem('session');

    if (persistentSession) {
      try {
        const { user, expiresAt } = JSON.parse(persistentSession);

        if (Date.now() < expiresAt) {
          sessionStorage.setItem('usuario', JSON.stringify(user));
          return user;
        }

        localStorage.removeItem('session');
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }
    return null;
  };

  const [usuarioUsed, setUsuarioUsed] = useState(getUsuarioFromSession());

  useEffect(() => {
    const applyThemeColors = async () => {
      const response = await getConfig();
      const config = response[0];

      // Aplicar como variables CSS globales
      document.documentElement.style.setProperty('--color-primario', config.colorpri);
      document.documentElement.style.setProperty('--color-secundario', config.colorsec);
      document.documentElement.style.setProperty('--color-ternario', config.colorter);
    };

    applyThemeColors();
  }, []);


  return (
    <Router>
      <Routes>
        {/* Ruta pública de login */}
        <Route path={UrlBase + "/login"} element={
          usuarioUsed ? <Navigate to={UrlLocal} /> : <Login setUsuarioUsed={setUsuarioUsed} />
        } />

        {/* Ruta por defecto - redirige al login o inicio dependiendo de la autenticación */}
        <Route path="/" element={
          usuarioUsed ? <Navigate to={UrlLocal} /> : <Navigate to={UrlBase + "/login"} />
        } />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path={UrlLocal} element={<Menu usuarioUsed={usuarioUsed} setUsuarioUsed={setUsuarioUsed} />} />
          {usuarioUsed && usuarioUsed.tipousuario && usuarioUsed.tipousuario.id === 1 && (
            <>
              <Route path={UrlLocal + "/security/users"} element={<UsuarioApp usuarioUsed={usuarioUsed} />} />
              <Route path={UrlLocal + "/security/access"} element={<AuditoriaApp usuarioUsed={usuarioUsed} />} />
              <Route path={UrlLocal + "/security/roles"} element={<RolApp usuarioUsed={usuarioUsed} />} />
              <Route path={UrlLocal + "/config"} element={<Configuracion usuarioUsed={usuarioUsed} />} />
              <Route path={UrlLocal + "/theme"} element={<Tema usuarioUsed={usuarioUsed} />} />
            </>
          )}
          <Route path={UrlLocal + "/calculations"} element={<FuncionarioApp usuarioUsed={usuarioUsed} />} />
          <Route path={UrlLocal + "/employees"} element={<FuncionarioApp usuarioUsed={usuarioUsed} />} />
          <Route path={UrlLocal + "/shifts"} element={<TurnoApp usuarioUsed={usuarioUsed} />} />
          <Route path={UrlLocal + '/profile'} element={<Perfil usuarioUsed={usuarioUsed} setUsuarioUsed={setUsuarioUsed} />} />
          <Route path={UrlLocal + '/changepassword'} element={<CambiarContrasena usuarioUsed={usuarioUsed} setUsuarioUsed={setUsuarioUsed} />} />
        </Route>

        {/* Ruta de error para rutas no definidas */}
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  )
}

export default App;