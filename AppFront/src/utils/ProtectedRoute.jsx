import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();

  // ProtectedRoute.jsx
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
  if (!isAuthenticated()) {
    return <Navigate to="/biotech/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, permite acceso a las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;