import { useState, useEffect } from 'react';
import { AddAccess } from './utils/AddAccess.js';
import { HostLocation } from './utils/HostLocation';
import { getConfig } from './services/config.service.js';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

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
        let activityListeners = [];
        const resetTimer = () => {
            const sessionData = localStorage.getItem('session');
            if (sessionData) {
                const { user } = JSON.parse(sessionData);
                const newExpiration = Date.now() + 60 * 60 * 1000;

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

        const events = [
            'mousemove', 'keydown', 'click', 'scroll',
            'touchstart', 'touchmove', 'wheel'
        ];

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
            activityListeners.push(event);
        });
        resetTimer();

        recuperarConfig();

        return () => {
            activityListeners.forEach(event =>
                window.removeEventListener(event, resetTimer)
            );
            clearTimeout(timeoutId);
        };
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        setShowLogoutModal(false);

        localStorage.removeItem('session');
        sessionStorage.removeItem('usuario');

        await AddAccess('Cerrar Sesión', 0, userLog, 'Login');
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
                <>
                    <div className="modal-overlay"></div>
                    <div className="logout-modal">
                        <div className="logout-card">
                            <i className="bi bi-box-arrow-right logout-icon"></i>
                            <h2 className="logout-title">¿Seguro que querés cerrar sesión?</h2>
                            <p className="logout-subtitle">
                                Tu sesión actual será finalizada y tendrás que volver a iniciar sesión.
                            </p>

                            <div className="logout-actions">
                                <button className="btn-logout-confirm" onClick={confirmLogout}>
                                    <i className="bi bi-check2-circle me-2"></i> Sí, cerrar
                                </button>

                                <button className="btn-logout-cancel" onClick={() => setShowLogoutModal(false)}>
                                    <i className="bi bi-x-circle me-2"></i> Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
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