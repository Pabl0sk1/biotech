import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAuditoria, getNetworkInfo } from './services/auditoria.service.js';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

export const Menu = ({ usuarioUsed, setUsuarioUsed }) => {
    const UrlBase = '/biotech';
    const UrlLocal = UrlBase + '/home';

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSeguridadMenuOpen, setIsSeguridadMenuOpen] = useState(false);
    const [isReportesMenuOpen, setIsReportesMenuOpen] = useState(false);
    const [isRegistrosMenuOpen, setIsRegistrosMenuOpen] = useState(false);
    const navigate = useNavigate();

    const obtenerFechaHora = async () => {
        const localDate = new Date();

        const dia = String(localDate.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
        const mes = String(localDate.getMonth()).padStart(2, '0'); // Los meses son 0-indexados, así que sumamos 1
        const anio = localDate.getFullYear();
        const hora = String(localDate.getHours() - 3).padStart(2, '0'); // Asegura que la hora tenga 2 dígitos
        const minuto = String(localDate.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan 2 dígitos

        return new Date(anio, mes, dia, hora, minuto);
    };

    const agregarAcceso = async (op, op2, path) => {
        const network = await recuperarNetworkInfo();
        const fechahora = await obtenerFechaHora();
        const auditoria = {
            id: null,
            usuario: {
                id: usuarioUsed.id
            },
            fechahora: fechahora,
            programa: op,
            operacion: op2,
            codregistro: 0,
            ip: network.ip,
            equipo: network.equipo
        }
        await saveAuditoria(auditoria);
        if (op !== 'Login') {
            navigate(path);
        }
    }

    // Función para alternar la visibilidad de la barra lateral
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const recuperarNetworkInfo = async () => {
        const response = await getNetworkInfo();
        return response;
    }

    // Menu.jsx - useEffect mejorado
    useEffect(() => {
        let timeoutId;
        let activityListeners = [];

        const resetTimer = () => {
            // Actualizar ambos almacenamientos
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

        // Eventos más completos
        const events = [
            'mousemove', 'keydown', 'click', 'scroll',
            'touchstart', 'touchmove', 'wheel'
        ];

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
            activityListeners.push(event);
        });

        // Inicializar timer
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

    // Menu.jsx - confirmLogout actualizado
    const confirmLogout = async () => {
        setShowLogoutModal(false);

        // Eliminar ambos almacenamientos
        localStorage.removeItem('session');
        sessionStorage.removeItem('usuario');

        // Limpiar estado y forzar recarga completa
        agregarAcceso('Login', 'Cerrar Sesión', '');
        setUsuarioUsed(null);
        window.location.href = '/biotech/login';
    };

    //Cancelar eliminación con tecla de escape
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

    // Despliegues de submenus
    const toggleSeguridadMenu = () => {
        setIsSeguridadMenuOpen(!isSeguridadMenuOpen);
    };
    const toggleReportesMenu = () => {
        setIsReportesMenuOpen(!isReportesMenuOpen);
    }
    const toggleRegistrosMenu = () => {
        setIsRegistrosMenuOpen(!isRegistrosMenuOpen);
    }

    // Carrusel de imagenes del menú
    const [imagenActual, setImagenActual] = useState('c1');
    useEffect(() => {
        const imagenes = ['c1', 'c2', 'c3', 'c4'];
        let index = 0;
        const intervalo = setInterval(() => {
            index = (index + 1) % imagenes.length;
            setImagenActual(imagenes[index]);
        }, 10000);
        return () => clearInterval(intervalo);
    }, []);

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

            <div className="menuBack position-fixed top-0 start-0 w-100 vh-100" style={{ backgroundImage: `url(/carrusel/${imagenActual}.jpg)` }}>
                <Header usuarioUsed={usuarioUsed} title={'INICIO'} onToggleSidebar={toggleSidebar} on={1} icon={'list-task'} />
                <Sidebar
                    usuarioUsed={usuarioUsed}
                    isSidebarVisible={isSidebarVisible}
                    toggleSeguridadMenu={toggleSeguridadMenu}
                    toggleReportesMenu={toggleReportesMenu}
                    toggleRegistrosMenu={toggleRegistrosMenu}
                    isSeguridadMenuOpen={isSeguridadMenuOpen}
                    isReportesMenuOpen={isReportesMenuOpen}
                    isRegistrosMenuOpen={isRegistrosMenuOpen}
                    agregarAcceso={agregarAcceso}
                    handleLogoutClick={handleLogoutClick}
                    UrlLocal={UrlLocal}
                />
            </div>
        </>
    )
}

export default Menu;