import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Menu from './Menu';
import ProtectedRoute from './ProtectedRoute.jsx';
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
import { ModuloApp } from './components/ModuloApp.jsx';
import { PermisoApp } from './components/PermisoApp.jsx';
import { getConfig } from "./services/config.service";
import { getPermission } from './services/permiso.service.js';

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
  const [permisos, setPermisos] = useState([]);

  const recuperarPermisos = async () => {
    const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario.id}`);
    setPermisos(response.items);
  }

  useEffect(() => {
    const aplicarTema = async () => {
      const response = await getConfig();
      const config = response.items[0];

      document.documentElement.style.setProperty('--color-primario', config.colorpri);
      document.documentElement.style.setProperty('--color-secundario', config.colorsec);
      document.documentElement.style.setProperty('--color-ternario', config.colorter);
    };
    aplicarTema();
    recuperarPermisos();
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

        {/* Menu principal */}
        <Route path={UrlLocal} element={
          <Menu userLog={userLog} setUserLog={setUserLog} />
        } />

        {/* Reportes */}
        <Route path={UrlLocal + "/reports/calcext"} element={
          <ProtectedRoute moduloVar="rp01" permisos={permisos}>
            <Calculo userLog={userLog} />
          </ProtectedRoute>
        } />

        {/* Registros */}
        <Route path={UrlLocal + "/regs/employees"} element={
          <ProtectedRoute moduloVar="rg01" permisos={permisos}>
            <FuncionarioApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/regs/sellers"} element={
          <ProtectedRoute moduloVar="rg02" permisos={permisos}>
            <VendedorApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/regs/branchs"} element={
          <ProtectedRoute moduloVar="rg03" permisos={permisos}>
            <SucursalApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/regs/positions"} element={
          <ProtectedRoute moduloVar="rg04" permisos={permisos}>
            <CargoApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/regs/schedules"} element={
          <ProtectedRoute moduloVar="rg05" permisos={permisos}>
            <ModalidadApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/regs/modules"} element={
          <ProtectedRoute moduloVar="rg06" permisos={permisos}>
            <ModuloApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/regs/shifts"} element={
          <ProtectedRoute moduloVar="rg07" permisos={permisos}>
            <TurnoApp userLog={userLog} />
          </ProtectedRoute>
        } />

        {/* Seguridad */}
        <Route path={UrlLocal + "/security/access"} element={
          <ProtectedRoute moduloVar="sc01" permisos={permisos}>
            <AuditoriaApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/security/users"} element={
          <ProtectedRoute moduloVar="sc02" permisos={permisos}>
            <UsuarioApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/security/roles"} element={
          <ProtectedRoute moduloVar="sc03" permisos={permisos}>
            <RolApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/security/tokens"} element={
          <ProtectedRoute moduloVar="sc04" permisos={permisos}>
            <TokenApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/security/permissions"} element={
          <ProtectedRoute moduloVar="sc05" permisos={permisos}>
            <PermisoApp userLog={userLog} />
          </ProtectedRoute>
        } />

        {/* Configuraciones */}
        <Route path={UrlLocal + "/profile"} element={
          <ProtectedRoute moduloVar="ma01" permisos={permisos}>
            <Perfil userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/changepassword"} element={
          <ProtectedRoute moduloVar="ma02" permisos={permisos}>
            <CambiarContrasena userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config"} element={
          <ProtectedRoute moduloVar="ma03" permisos={permisos}>
            <Configuracion userLog={userLog} />
          </ProtectedRoute>
        } />

        {/* Ruta de error para rutas no definidas */}
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  )
}

export default App;