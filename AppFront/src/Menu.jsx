import { useState, useEffect } from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import { AddAccess } from './utils/AddAccess.js';

export const Menu = ({ userLog, setUserLog }) => {

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSeguridadMenuOpen, setIsSeguridadMenuOpen] = useState(false);
    const [isReportesMenuOpen, setIsReportesMenuOpen] = useState(false);
    const [isRegistrosMenuOpen, setIsRegistrosMenuOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

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

    const toggleSeguridadMenu = () => {
        setIsSeguridadMenuOpen(!isSeguridadMenuOpen);
    };
    const toggleReportesMenu = () => {
        setIsReportesMenuOpen(!isReportesMenuOpen);
    }
    const toggleRegistrosMenu = () => {
        setIsRegistrosMenuOpen(!isRegistrosMenuOpen);
    }

    return (
        <>

            {showLogoutModal && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-dark alert-dismissible fade show m-2 p-3 shadow-sm" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-box-arrow-left" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-3'>¿Cerrar Sesión?</p>
                                </div>
                                <div className="mt-4">
                                    <button type="button" className="btn btn-light me-4 fw-bold border-black" onClick={confirmLogout}>
                                        <i className="bi bi-check-lg me-2"></i>Aceptar
                                    </button>
                                    <button type="button" className="btn btn-light fw-bold border-black" onClick={() => setShowLogoutModal(false)}>
                                        <i className="bi bi-x-lg me-2"></i>Cancelar
                                    </button>
                                </div>
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
                    toggleSeguridadMenu={toggleSeguridadMenu}
                    toggleReportesMenu={toggleReportesMenu}
                    toggleRegistrosMenu={toggleRegistrosMenu}
                    isSeguridadMenuOpen={isSeguridadMenuOpen}
                    isReportesMenuOpen={isReportesMenuOpen}
                    isRegistrosMenuOpen={isRegistrosMenuOpen}
                    handleLogoutClick={handleLogoutClick}
                />
            </div>
        </>
    )
}

export default Menu;