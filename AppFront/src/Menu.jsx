import { useState, useEffect } from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import { AddAccess } from './utils/AddAccess.js';

export const Menu = ({ userLog, setUserLog }) => {

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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
                {userLog?.vermapa && userLog?.sucursal?.id == 13 && (
                    <iframe title="Informe_Mapa_000" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=0e941ed0-c4cb-41ee-bb1b-2c6ab4286769&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 1 && (
                    <iframe title="Informe_Mapa_001" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=61ce142f-dfd3-4ed5-b42f-2ca58f3f0224&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 2 && (
                    <iframe title="Informe_Mapa_002" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=395698d4-ec84-4b21-b25f-16c4179378eb&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 3 && (
                    <iframe title="Informe_Mapa_003" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=ec3842bc-417d-4f75-9e0b-de6ad38af47d&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 4 && (
                    <iframe title="Informe_Mapa_004" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=23b78457-c37d-42d2-97f8-1f2af0bbd5a3&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 5 && (
                    <iframe title="Informe_Mapa_005" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=2f8886e2-87da-4d26-ba3e-a6cd6e028817&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 6 && (
                    <iframe title="Informe_Mapa_006" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=40fe07f0-da0f-42eb-8120-91812b45e51e&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 7 && (
                    <iframe title="Informe_Mapa_007" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=f5fdbded-fb12-4796-879e-13b1e0e05b8b&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 8 && (
                    <iframe title="Informe_Mapa_008" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=65723b51-2a23-4eb2-bf62-b709854d810f&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 9 && (
                    <iframe title="Informe_Mapa_009" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=baffa751-a68a-4276-ae74-8dda5f6da685&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 10 && (
                    <iframe title="Informe_Mapa_010" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=c25975a2-9377-468c-9157-e5b06b644ebb&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 11 && (
                    <iframe title="Informe_Mapa_011" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=c7d9d9bd-92b5-41ac-91b6-748e27172fe7&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
                {userLog?.vermapa && userLog?.sucursal?.id == 12 && (
                    <iframe title="Informe_Mapa_012" className='map-box' src="https://app.powerbi.com/reportEmbed?reportId=fc2e9f68-a885-4597-b2ec-9f29a01fca7f&autoAuth=true&ctid=40624d4e-58ff-4299-b81f-b7b4ff748c91"></iframe>
                )}
            </div>
        </>
    )
}

export default Menu;