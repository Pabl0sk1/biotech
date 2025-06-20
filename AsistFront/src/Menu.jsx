import { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { Link, useNavigate } from 'react-router-dom';
import { saveAuditoria, getNetworkInfo } from './services/auditoria.service.js';

export const Menu = ({ usuarioUsed, setUsuarioUsed }) => {
    const UrlBase = '/asist';
    const UrlLocal = UrlBase + '/home';

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isInformeMenuOpen, setIsInformeMenuOpen] = useState(false);
    const [isRegistroMenuOpen, setIsRegistroMenuOpen] = useState(false);
    const [isSeguridadMenuOpen, setIsSeguridadMenuOpen] = useState(false);
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

    useEffect(() => {
    }, [])

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
            window.location.href = '/asist/login';
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
        window.location.href = '/asist/login';
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

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha + 'T00:00:00Z');
        const day = String(date.getUTCDate()).padStart(2, '0'); // Agrega un cero si es necesario
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    const toggleInformeMenu = () => {
        setIsInformeMenuOpen(!isInformeMenuOpen);
    };

    const toggleRegistroMenu = () => {
        setIsRegistroMenuOpen(!isRegistroMenuOpen);
    };

    const toggleSeguridadMenu = () => {
        setIsSeguridadMenuOpen(!isSeguridadMenuOpen);
    };

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

            <div className="row w-100 m-0">
                <nav className="navbar navbar-expand-lg navbar-light bg-white top-0 position-fixed p-0 z-1 w-100 user-select-none border-3 border-black border-bottom">
                    <div className="d-flex w-100">
                        <div className="col-2 d-flex align-items-center m-0 p-1 ps-3 border-end border-dark border-3">
                            <button className='me-3 p-0 text-black ps-1 pe-1 border-0 menuList' onClick={toggleSidebar}>
                                <i className='bi bi-list-task fs-3' style={{ textShadow: '1px 0 0 black, 0 1px 0 black, -1px 0 0 black, 0 -1px 0 black' }}></i>
                            </button>
                            <p className='m-0'>INICIO</p>
                        </div>
                        <div className='d-flex align-items-center ps-3'>
                            <i className='bi bi-person fs-3 me-3'></i>
                            <p className='m-0'>{usuarioUsed.tipousuario.tipousuario}</p>
                        </div>
                        <div className='d-flex align-items-center ms-auto'>
                            <img className="navbar-brand p-0 m-0 me-3" src="/logo.png" alt="Maria Mora Atelier" style={{ width: '120px', height: '40px' }} />
                        </div>
                    </div>
                </nav>
                <div className={`col-2 bg-dark p-0 vh-100 pt-5 ${isSidebarVisible ? '' : 'd-none'} user-select-none`} style={{ fontSize: '14px' }}>
                    <div className="d-flex flex-column text-white">
                        <ul className="nav flex-column fw-bold text-start">
                            <li className='d-flex nav-item pb-1 pt-2 ps-3'>
                                <i className='bi bi-person me-2'></i>
                                <p className='m-0 usuarioNombre'>{usuarioUsed.nombreusuario}</p>
                            </li>
                            <li className='nav-item menuTitle'>
                                <Link className="nav-link text-white" onClick={() => agregarAcceso("Funcionarios", 'Consultar', UrlLocal + "/employees")}>
                                    <i className='bi bi-people me-2'></i>
                                    Funcionarios
                                </Link>
                            </li>
                            <li className='nav-item menuTitle'>
                                <Link className="nav-link text-white" onClick={() => agregarAcceso("Turnos", 'Consultar', UrlLocal + "/shifts")}>
                                    <i className="bi bi-fingerprint me-2"></i>
                                    Turnos
                                </Link>
                            </li>
                            {/*Seguridad lista*/}
                            {usuarioUsed.tipousuario.id === 1 && (
                                <li className="nav-item">
                                    <a role="button" onClick={toggleSeguridadMenu} href="#" aria-controls="seguridadMenu" className='d-flex w-100 align-items-center ps-0 pt-2 pb-2 link-light menuTitle'>
                                        <i className='bi bi-lock ps-3 pe-2'></i>
                                        Seguridad
                                        <span className="ms-auto me-3">
                                            <i className={`bi ${isSeguridadMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                        </span>
                                    </a>
                                    <ul className={`nav collapse menuSubtitle fw-normal ${isSeguridadMenuOpen ? 'show' : ''}`} id='seguridadMenu'>
                                        <li className="nav-item menuSubtitleItem ps-4 w-100"><Link to={UrlLocal + "/security/access"} className="nav-link text-white p-1">Accesos</Link></li>
                                        <li className="nav-item menuSubtitleItem ps-4 w-100"><Link onClick={() => agregarAcceso("Usuarios", 'Consultar', UrlLocal + "/security/users")} className="nav-link text-white p-1">Usuarios</Link></li>
                                        <li className="nav-item menuSubtitleItem ps-4 w-100"><Link onClick={() => agregarAcceso("Roles", 'Consultar', UrlLocal + "/security/roles")} className="nav-link text-white p-1">Roles</Link></li>
                                    </ul>
                                </li>
                            )}
                            <li className='nav-item menuTitle'>
                                <Link className="nav-link text-white" onClick={() => agregarAcceso("Perfil", 'Modificar', UrlLocal + "/profile")}>
                                    <i className='bi bi-person-circle me-2'></i>
                                    Perfil
                                </Link>
                            </li>
                            <li className='nav-item menuTitle'>
                                <Link className="nav-link text-white" onClick={() => agregarAcceso("Cambiar Contraseña", 'Modificar', UrlLocal + "/changepassword")}>
                                    <i className='bi bi-key me-2'></i>
                                    Cambiar Contraseña
                                </Link>
                            </li>
                            {usuarioUsed.tipousuario.id === 1 && (
                                <li className='nav-item menuTitle'>
                                    <Link className="nav-link text-white" onClick={() => agregarAcceso("Tema", 'Modificar', UrlLocal + "/theme")}>
                                        <i className='bi bi-palette me-2'></i>
                                        Tema
                                    </Link>
                                </li>
                            )}
                            {usuarioUsed.tipousuario.id === 1 && (
                                <li className='nav-item menuTitle'>
                                    <Link className="nav-link text-white" onClick={() => agregarAcceso("Configuración", 'Modificar', UrlLocal + "/config")}>
                                        <i className='bi bi-gear me-2'></i>
                                        Configuración
                                    </Link>
                                </li>
                            )}
                            <li className='nav-item menuTitle'>
                                <Link className="nav-link text-white" onClick={handleLogoutClick}>
                                    <i className='bi bi-chevron-double-left me-2'></i>
                                    Salir
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Menu;