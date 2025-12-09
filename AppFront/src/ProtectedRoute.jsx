import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Error } from './Error';

const ProtectedRoute = ({ moduloVar, permisos, children }) => {
  const location = useLocation();

  const tienePermisoRuta = (moduloVar) => {
    if (!permisos) return false;

    const permiso = permisos.find(p => p.modulo.var.toLowerCase().trim() == moduloVar.toLowerCase().trim());
    return permiso?.puedeconsultar || false;
  };

  const isAuthenticated = () => {
    // Primero verificar sessionStorage para sesión activa
    const sessionUser = sessionStorage.getItem('usuario');
    if (sessionUser) return true;

    // Si no hay en sessionStorage, verificar localStorage
    const persistentSession = localStorage.getItem('session');
    if (!persistentSession) return false;

    try {
      const { user, expiresAt } = JSON.parse(persistentSession);
      if (Date.now() > expiresAt) {
        localStorage.removeItem('session');
        return false;
      }
      // Restaurar sesión en sessionStorage
      sessionStorage.setItem('usuario', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error parsing session:', error);
      return false;
    }
  };

  // Si no está autenticado, redirige al login y guarda la ubicación intentada
  if (!isAuthenticated()) return <Navigate to="/biotech/login" state={{ from: location }} replace />;


  // Validar permiso si se pasó moduloVar
  if (!tienePermisoRuta(moduloVar)) return <Error />;

  // Si está autenticado, permite acceso a las rutas hijas
  return children;
};

export default ProtectedRoute;