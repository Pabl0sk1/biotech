import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from './Login.jsx';
import Menu from './Menu';
import CambiarContrasena from './CambiarContrasena.jsx';
import Perfil from './Perfil.jsx';
import Configuracion from './Configuracion.jsx';
import HoraExtra from './tasks/HoraExtra.jsx';
import Planeamiento from './tasks/Planeamiento.jsx';
import Error from './Error.jsx';
import Dashboard from './Dashboard.jsx';
import { UsuarioApp } from './components/UsuarioApp.jsx';
import { AuditoriaApp } from './components/AuditoriaApp.jsx';
import { RolApp } from './components/RolApp.jsx';
import { TurnoApp } from './components/TurnoApp.jsx';
import { CargoApp } from './components/CargoApp.jsx';
import { ModalidadApp } from './components/ModalidadApp.jsx';
import { TokenApp } from './components/TokenApp.jsx';
import { SucursalApp } from './components/SucursalesApp.jsx';
import { ModuloApp } from './components/ModuloApp.jsx';
import { PermisoApp } from './components/PermisoApp.jsx';
import { CarteraApp } from './components/CarteraApp.jsx';
import { ZafraApp } from './components/ZafraApp.jsx';
import { MedidaApp } from './components/MedidaApp.jsx';
import { MonedaApp } from './components/MonedaApp.jsx';
import { EntidadApp } from './components/EntidadApp.jsx';
import { FaseCultivoApp } from './components/FaseCultivoApp.jsx';
import { TributacionApp } from './components/TributacionApp.jsx';
import { CategoriaApp } from './components/CategoriaApp.jsx';
import { ClaseApp } from './components/ClaseApp.jsx';
import { PrincipioActivoApp } from './components/PrincipioActivoApp.jsx';
import { GrupoProductoApp } from './components/GrupoProductoApp.jsx';
import { NombreComercialApp } from './components/NombreComercialApp.jsx';
import { ProductoApp } from './components/ProductoApp.jsx';
import { MenuApp } from './components/MenuApp.jsx';
import { getConfig } from "./services/config.service";
import { getPermission } from './services/permiso.service.js';
import { EscenarioApp } from './components/EscenarioApp.jsx';
import { HoraExtraApp } from './components/HoraExtraApp.jsx';
import { PlaneamientoApp } from './components/PlaneamientoApp.jsx';

function App() {
  const UrlLocal = '/home';

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
    const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id}`);
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
  }, []);

  useEffect(() => {
    if (userLog) {
      recuperarPermisos();
    }
  }, [userLog]);

  return (
    <Router basename='/biotech'>
      <Routes>
        {/* Ruta pública de login */}
        <Route path={"/login"} element={
          userLog ? <Navigate to={UrlLocal} /> : <Login setUserLog={setUserLog} />
        } />

        {/* Ruta por defecto - redirige al login o inicio dependiendo de la autenticación */}
        <Route path="/" element={
          userLog ? <Navigate to={UrlLocal} /> : <Navigate to={"/login"} />
        } />

        {/* Menu principal */}
        <Route path={UrlLocal} element={
          <Menu userLog={userLog} setUserLog={setUserLog} />
        } />

        {/* Dashboard */}
        <Route path={UrlLocal + "/dashboard"} element={
          <ProtectedRoute moduloVar="dh01" permisos={permisos}>
            <Dashboard userLog={userLog} />
          </ProtectedRoute>
        } />

        {/* Principal - Comercial */}
        <Route path={UrlLocal + "/main/commercial/planning"} element={
          <ProtectedRoute moduloVar="cm03" permisos={permisos}>
            <PlaneamientoApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/main/commercial/planning/:id"} element={
          <ProtectedRoute moduloVar="cm03" permisos={permisos}>
            <Planeamiento />
          </ProtectedRoute>
        } />
        {/* Principal - RRHH */}
        <Route path={UrlLocal + "/main/rrhh/calcext"} element={
          <ProtectedRoute moduloVar="rh04" permisos={permisos}>
            <HoraExtraApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/main/rrhh/calcext/:id"} element={
          <ProtectedRoute moduloVar="rh04" permisos={permisos}>
            <HoraExtra />
          </ProtectedRoute>
        } />

        {/* Catastros */}
        <Route path={UrlLocal + "/cadastres/entities"} element={
          <ProtectedRoute moduloVar="ca01" permisos={permisos}>
            <EntidadApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/cadastres/products"} element={
          <ProtectedRoute moduloVar="ca02" permisos={permisos}>
            <ProductoApp userLog={userLog} />
          </ProtectedRoute>
        } />

        {/* Configuraciones - Generales */}
        <Route path={UrlLocal + "/config/general/crops"} element={
          <ProtectedRoute moduloVar="gr01" permisos={permisos}>
            <FaseCultivoApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/general/currencies"} element={
          <ProtectedRoute moduloVar="gr02" permisos={permisos}>
            <MonedaApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/general/branchs"} element={
          <ProtectedRoute moduloVar="gr03" permisos={permisos}>
            <SucursalApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/general/taxations"} element={
          <ProtectedRoute moduloVar="gr04" permisos={permisos}>
            <TributacionApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/general/taxations"} element={
          <ProtectedRoute moduloVar="gr04" permisos={permisos}>
            <TributacionApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/general/harvests"} element={
          <ProtectedRoute moduloVar="gr05" permisos={permisos}>
            <ZafraApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/general/categories"} element={
          <ProtectedRoute moduloVar="gr06" permisos={permisos}>
            <CategoriaApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/general/scenarios"} element={
          <ProtectedRoute moduloVar="gr07" permisos={permisos}>
            <EscenarioApp userLog={userLog} />
          </ProtectedRoute>
        } />
        {/* Configuraciones - RRHH */}
        <Route path={UrlLocal + "/config/rrhh/positions"} element={
          <ProtectedRoute moduloVar="rh01" permisos={permisos}>
            <CargoApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/rrhh/schedules"} element={
          <ProtectedRoute moduloVar="rh02" permisos={permisos}>
            <ModalidadApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/rrhh/shifts"} element={
          <ProtectedRoute moduloVar="rh03" permisos={permisos}>
            <TurnoApp userLog={userLog} />
          </ProtectedRoute>
        } />
        {/* Configuraciones - Comercial */}
        <Route path={UrlLocal + "/config/commercial/wallets"} element={
          <ProtectedRoute moduloVar="cm01" permisos={permisos}>
            <CarteraApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/commercial/tradenames"} element={
          <ProtectedRoute moduloVar="cm02" permisos={permisos}>
            <NombreComercialApp userLog={userLog} />
          </ProtectedRoute>
        } />
        {/* Configuraciones - Productos */}
        <Route path={UrlLocal + "/config/product/productgroups"} element={
          <ProtectedRoute moduloVar="pr01" permisos={permisos}>
            <GrupoProductoApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/product/measures"} element={
          <ProtectedRoute moduloVar="pr02" permisos={permisos}>
            <MedidaApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/product/assets"} element={
          <ProtectedRoute moduloVar="pr03" permisos={permisos}>
            <PrincipioActivoApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/config/product/classes"} element={
          <ProtectedRoute moduloVar="pr04" permisos={permisos}>
            <ClaseApp userLog={userLog} />
          </ProtectedRoute>
        } />

        {/* Seguridad */}
        <Route path={UrlLocal + "/security/access"} element={
          <ProtectedRoute moduloVar="sc01" permisos={permisos}>
            <AuditoriaApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/security/modules"} element={
          <ProtectedRoute moduloVar="sc02" permisos={permisos}>
            <ModuloApp userLog={userLog} />
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
        <Route path={UrlLocal + "/security/users"} element={
          <ProtectedRoute moduloVar="sc06" permisos={permisos}>
            <UsuarioApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/security/menus"} element={
          <ProtectedRoute moduloVar="sc06" permisos={permisos}>
            <MenuApp userLog={userLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/profile"} element={
          <ProtectedRoute moduloVar="sc08" permisos={permisos}>
            <Perfil userLog={userLog} setUserLog={setUserLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/security/changepassword"} element={
          <ProtectedRoute moduloVar="sc09" permisos={permisos}>
            <CambiarContrasena userLog={userLog} setUserLog={setUserLog} />
          </ProtectedRoute>
        } />
        <Route path={UrlLocal + "/company"} element={
          <ProtectedRoute moduloVar="sc10" permisos={permisos}>
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