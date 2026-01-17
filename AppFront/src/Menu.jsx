import { useState, useEffect } from 'react';
import { AddAccess } from './utils/AddAccess.js';
import { HostLocation } from './utils/HostLocation';
import { getConfig } from './services/config.service.js';
import { updateUser } from './services/usuario.service.js';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import LogoutModal from './layouts/LogoutModal.jsx';

export const Menu = ({ userLog, setUserLog }) => {

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [logo, setLogo] = useState(null);

    const recuperarConfig = async () => {
        const response = await getConfig();

        const BACKEND_URL = HostLocation(1);
        if (response.items[0].imagenurl) setLogo(BACKEND_URL + "/biotech" + response.items[0].imagenurl);
    }

    useEffect(() => {
        let timeoutId;
        let checkIntervalId;
        let activityListeners = [];

        // Verificar si la sesión ya expiró al cargar
        const checkSession = () => {
            const sessionData = localStorage.getItem('session');
            if (sessionData) {
                const { expiresAt } = JSON.parse(sessionData);
                if (Date.now() >= expiresAt) {
                    logoutByInactivity();
                    return false;
                }
            }
            return true;
        };

        const resetTimer = () => {
            const sessionData = localStorage.getItem('session');
            if (sessionData) {
                const { user } = JSON.parse(sessionData);
                const newExpiration = Date.now() + 60 * 60 * 1000; // 1 hora

                localStorage.setItem('session', JSON.stringify({
                    user,
                    expiresAt: newExpiration
                }));

                sessionStorage.setItem('usuario', JSON.stringify(user));
            }

            clearTimeout(timeoutId);
            timeoutId = setTimeout(logoutByInactivity, 60 * 60 * 1000);
        };

        const logoutByInactivity = () => {
            localStorage.removeItem('session');
            sessionStorage.removeItem('usuario');
            window.location.href = '/biotech/login';
        };

        // Verificar sesión al cargar
        if (!checkSession()) {
            return; // Si ya expiró, no continuar
        }

        const events = [
            'mousemove', 'keydown', 'click', 'scroll',
            'touchstart', 'touchmove', 'wheel'
        ];

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
            activityListeners.push(event);
        });

        // Verificar cada minuto si la sesión expiró (para pestañas inactivas)
        checkIntervalId = setInterval(checkSession, 60000);

        resetTimer();
        recuperarConfig();

        return () => {
            activityListeners.forEach(event =>
                window.removeEventListener(event, resetTimer)
            );
            clearTimeout(timeoutId);
            clearInterval(checkIntervalId);
        };
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        setShowLogoutModal(false);

        localStorage.removeItem('session');
        sessionStorage.removeItem('usuario');

        const usuario = {
            ...userLog,
            online: false
        }

        await AddAccess('Cerrar Sesión', 0, userLog, 'Login');
        await updateUser(usuario.id, usuario);

        setUserLog(null);
        window.location.href = '/biotech/login';
    };

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setShowLogoutModal(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <>

            {showLogoutModal && (
                <LogoutModal confirm={confirmLogout} setClose={setShowLogoutModal} />
            )}

            <div className="position-fixed top-0 start-0 w-100 vh-100">
                <Header userLog={userLog} title={'INICIO'} onToggleSidebar={toggleSidebar} on={1} icon={'list-task'} />
                <Sidebar
                    userLog={userLog}
                    isSidebarVisible={isSidebarVisible}
                    handleLogoutClick={handleLogoutClick}
                />
                <div className='logoMenu'>
                    <img src={logo} alt="Logo Empresa" />
                </div>
            </div>
        </>
    )
}

export default Menu;