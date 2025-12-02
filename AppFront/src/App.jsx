import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Menu from './Menu';
import ProtectedRoute from '../src/utils/ProtectedRoute.jsx';
import CambiarContrasena from './CambiarContrasena.jsx';
import Perfil from './Perfil.jsx';
import Configuracion from './Configuracion.jsx';
import { UsuarioApp } from './components/UsuarioApp.jsx';
import { AuditoriaApp } from './components/AuditoriaApp.jsx';
import { RolApp } from './components/RolApp.jsx';
import { TurnoApp } from './components/TurnoApp.jsx';
import { FuncionarioApp } from './components/FuncionarioApp.jsx';
import { Error } from './Error.jsx';
import { Calculo } from './tasks/Calculo.jsx'
import { CargoApp } from './components/CargoApp.jsx';
import { ModalidadApp } from './components/ModalidadApp.jsx';
import { TokenApp } from './components/TokenApp.jsx';
import { VendedorApp } from './components/VendedorApp.jsx';
import { SucursalApp } from './components/SucursalesApp.jsx';
import { getConfig } from "./services/config.service";

function App() {
  const UrlBase = '/biotech';
  const UrlLocal = UrlBase + '/home';

  const getUserFromSession = () => {
    const sessionUser = sessionStorage.getItem('usuario');
    if (sessionUser) return JSON.parse(sessionUser);
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

  const [userLog, setUserLog] = useState(getUserFromSession());

  useEffect(() => {
    const applyThemeColors = async () => {
      const response = await getConfig();
      const config = response.items[0];

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
          userLog ? <Navigate to={UrlLocal} /> : <Login setUserLog={setUserLog} />
        } />

        {/* Ruta por defecto - redirige al login o inicio dependiendo de la autenticación */}
        <Route path="/" element={
          userLog ? <Navigate to={UrlLocal} /> : <Navigate to={UrlBase + "/login"} />
        } />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path={UrlLocal} element={<Menu userLog={userLog} setUserLog={setUserLog} />} />
          {userLog?.tipousuario?.id && [1].includes(userLog.tipousuario.id) && (
            <>
              <Route path={UrlLocal + "/security/users"} element={<UsuarioApp userLog={userLog} />} />
              <Route path={UrlLocal + "/security/roles"} element={<RolApp userLog={userLog} />} />
              <Route path={UrlLocal + "/security/tokens"} element={<TokenApp userLog={userLog} />} />
              <Route path={UrlLocal + "/config"} element={<Configuracion userLog={userLog} />} />
              <Route path={UrlLocal + "/regs/shifts"} element={<TurnoApp userLog={userLog} />} />
              <Route path={UrlLocal + "/regs/schedules"} element={<ModalidadApp userLog={userLog} />} />
            </>
          )}
          {userLog?.tipousuario?.id && [1, 5].includes(userLog.tipousuario.id) && (
            <>
              <Route path={UrlLocal + "/security/access"} element={<AuditoriaApp userLog={userLog} />} />
            </>
          )}
          {userLog?.tipousuario?.id && [1, 2, 5].includes(userLog.tipousuario.id) && (
            <>
              <Route path={UrlLocal + "/reports/calcext"} element={<Calculo userLog={userLog} />} />
              <Route path={UrlLocal + "/regs/employees"} element={<FuncionarioApp userLog={userLog} />} />
              <Route path={UrlLocal + "/regs/positions"} element={<CargoApp userLog={userLog} />} />
            </>
          )}
          {userLog?.tipousuario?.id && [1, 9].includes(userLog.tipousuario.id) && (
            <>
              <Route path={UrlLocal + "/regs/sellers"} element={<VendedorApp userLog={userLog} />} />
            </>
          )}
          <Route path={UrlLocal + "/regs/branchs"} element={<SucursalApp userLog={userLog} />} />
          <Route path={UrlLocal + '/profile'} element={<Perfil userLog={userLog} setUserLog={setUserLog} />} />
          <Route path={UrlLocal + '/changepassword'} element={<CambiarContrasena userLog={userLog} setUserLog={setUserLog} />} />
        </Route>

        {/* Ruta de error para rutas no definidas */}
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  )
}

export default App;