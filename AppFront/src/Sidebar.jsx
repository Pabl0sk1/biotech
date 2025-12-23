import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AddAccess } from './utils/AddAccess.js';
import { getMenu } from './services/menu.service.js';
import { HostLocation } from './utils/HostLocation';

const Sidebar = ({
    userLog,
    isSidebarVisible,
    handleLogoutClick,
    permisos
}) => {
    const UrlLocal = '/home';
    const [hoveredItem, setHoveredItem] = useState(null);
    const [menus, setMenus] = useState([]);
    const [isSeguridadMenuOpen, setIsSeguridadMenuOpen] = useState(false);
    const [isCatastrosMenuOpen, setIsCatastrosMenuOpen] = useState(false);
    const [isConfiguracionesMenuOpen, setIsConfiguracionesMenuOpen] = useState(false);
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        const load = async () => {
            const response = await getMenu();
            setMenus(response.items);
        }
        load();

        const BACKEND_URL = HostLocation(1);
        console.log(BACKEND_URL + userLog?.imagenurl);
        if (userLog?.imagenurl) setAvatar(BACKEND_URL + userLog?.imagenurl);
    }, []);

    const tienePermisoRuta = (moduloVar) => {
        if (!permisos) return false;

        return moduloVar.some(mod => {
            const permiso = permisos.find(
                p => p.modulo.var.toLowerCase().trim() === mod.toLowerCase().trim()
            );
            return permiso?.puedeconsultar === true;
        });
    };

    const toggleMenu = (menu) => {
        setIsSeguridadMenuOpen(menu === 'seguridad' ? !isSeguridadMenuOpen : false);
        setIsCatastrosMenuOpen(menu === 'catastros' ? !isCatastrosMenuOpen : false);
        setIsConfiguracionesMenuOpen(menu === 'configuraciones' ? !isConfiguracionesMenuOpen : false);
    };

    const menuItemStyle = (isHovered) => ({
        transition: 'all 0.3s ease',
        background: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        border: isHovered ? '0 solid transparent' : '0 solid transparent',
        borderLeftWidth: '4px',
        borderLeftColor: isHovered ? '#15ff00ff' : 'transparent',
    });

    const subMenuItemStyle = (isHovered) => ({
        transition: 'all 0.3s ease',
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        borderRadius: isHovered ? '6px' : '0',
        marginLeft: '8px',
        marginRight: '8px',
    });

    return (
        <div
            className={`sidebar-modern z-0 ${isSidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}
            style={{
                width: '280px',
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #1a1d29 0%, #2d3748 100%)',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 1000,
                transition: 'transform 0.3s ease',
                transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
                boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
                fontSize: '14px',
            }}
        >
            {/* Header del Sidebar */}
            <div
                style={{
                    padding: '65px 20px 10px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link className="perfilBtn"
                        to={tienePermisoRuta(['sc08']) ? UrlLocal + '/profile' : ''}
                        onClick={async () => { tienePermisoRuta(['sc08']) ? await AddAccess('Modificar', 0, userLog, 'Perfil') : '' }}
                        style={{ cursor: tienePermisoRuta(['sc08']) ? 'pointer' : 'default' }}
                    >
                        {avatar ? (
                            <img
                                src={avatar}
                                alt="Perfil"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            userLog?.nombreusuario?.charAt(0).toUpperCase()
                        )}
                    </Link>
                    <div className='text-start'>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
                            {userLog?.nombreusuario}
                        </div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                            En línea
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido del menú */}
            <div style={{ padding: '16px 0', overflowY: 'auto', height: 'calc(100vh - 120px)' }}>
                <nav>
                    {/* Catastros */}
                    {tienePermisoRuta(['ca01', 'ca02']) && (
                        <div style={{ marginBottom: '8px' }}>
                            <button
                                onClick={() => toggleMenu('catastros')}
                                onMouseEnter={() => setHoveredItem('catastros')}
                                onMouseLeave={() => setHoveredItem(null)}
                                style={{
                                    ...menuItemStyle(hoveredItem === 'catastros'),
                                    width: '100%',
                                    background: 'none',
                                    color: 'white',
                                    padding: '12px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                    className='colorSecundario'
                                >
                                    <i className="bi bi-box text-black"></i>
                                </div>
                                <span style={{ flex: 1, textAlign: 'left' }}>Catastros</span>
                                <i className={`bi ${isCatastrosMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                            </button>
                            <div style={{
                                maxHeight: isCatastrosMenuOpen ? '500px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease',
                            }}>
                                {tienePermisoRuta(['ca01']) && (
                                    <Link
                                        to={UrlLocal + '/cadastres/entities'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Entidades')}
                                        onMouseEnter={() => setHoveredItem('entidades')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'entidades'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Entidades<div className='recurso'>CA01</div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Generales */}
                    {tienePermisoRuta(['gr01', 'gr02', 'gr03', 'gr04', 'gr05', 'gr06', 'rh01', 'rh02', 'rh03', 'rh04', 'cm01', 'cm02', 'pr01', 'pr02', 'pr03', 'pr04']) && (
                        <div style={{ marginBottom: '8px' }}>
                            <button
                                onClick={() => toggleMenu('configuraciones')}
                                onMouseEnter={() => setHoveredItem('configuraciones')}
                                onMouseLeave={() => setHoveredItem(null)}
                                style={{
                                    ...menuItemStyle(hoveredItem === 'configuraciones'),
                                    width: '100%',
                                    background: 'none',
                                    color: 'white',
                                    padding: '12px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                    className='colorSecundario'
                                >
                                    <i className="bi bi-gear text-black"></i>
                                </div>
                                <span style={{ flex: 1, textAlign: 'left' }}>Configuración</span>
                                <i className={`bi ${isConfiguracionesMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                            </button>
                            <div style={{
                                maxHeight: isConfiguracionesMenuOpen ? '500px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease',
                            }}>
                                {tienePermisoRuta(['gr01']) && (
                                    <Link
                                        to={UrlLocal + '/config/general/crops'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Fase de Cultivos')}
                                        onMouseEnter={() => setHoveredItem('fasecultivos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'fasecultivos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Fase de Cultivos<div className='recurso'>GR01</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['gr02']) && (
                                    <Link
                                        to={UrlLocal + '/config/general/currencies'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Monedas')}
                                        onMouseEnter={() => setHoveredItem('monedas')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'monedas'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Monedas<div className='recurso'>GR02</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['gr03']) && (
                                    <Link
                                        to={UrlLocal + '/config/general/branchs'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Sucursales')}
                                        onMouseEnter={() => setHoveredItem('sucursales')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'sucursales'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Sucursales<div className='recurso'>GR03</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['gr04']) && (
                                    <Link
                                        to={UrlLocal + '/config/general/taxations'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Tributaciones')}
                                        onMouseEnter={() => setHoveredItem('tributaciones')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'tributaciones'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Tributaciones<div className='recurso'>GR04</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['gr05']) && (
                                    <Link
                                        to={UrlLocal + '/config/general/harvests'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Zafras')}
                                        onMouseEnter={() => setHoveredItem('zafras')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'zafras'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Zafras<div className='recurso'>GR05</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['gr06']) && (
                                    <Link
                                        to={UrlLocal + '/config/general/categories'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Categorias')}
                                        onMouseEnter={() => setHoveredItem('categorias')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'categorias'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Categorías<div className='recurso'>GR06</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['rh01']) && (
                                    <Link
                                        to={UrlLocal + '/config/rrhh/positions'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Cargos')}
                                        onMouseEnter={() => setHoveredItem('cargos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'cargos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Cargos<div className='recurso'>RH01</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['rh02']) && (
                                    <Link
                                        to={UrlLocal + '/config/rrhh/schedules'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Modalidades')}
                                        onMouseEnter={() => setHoveredItem('modalidades')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'modalidades'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Modalidades<div className='recurso'>RH02</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['rh03']) && (
                                    <Link
                                        to={UrlLocal + '/config/rrhh/shifts'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Turnos')}
                                        onMouseEnter={() => setHoveredItem('turnos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'turnos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Turnos<div className='recurso'>RH03</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['rh04']) && (
                                    <Link
                                        to={UrlLocal + '/config/rrhh/calcext'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Horas Extras')}
                                        onMouseEnter={() => setHoveredItem('horasextras')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'horasextras'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Horas Extras<div className='recurso'>RH04</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['cm01']) && (
                                    <Link
                                        to={UrlLocal + '/config/commercial/wallets'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Carteras')}
                                        onMouseEnter={() => setHoveredItem('carteras')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'carteras'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Carteras<div className='recurso'>CM01</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['pr02']) && (
                                    <Link
                                        to={UrlLocal + '/config/product/measures'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Medidas')}
                                        onMouseEnter={() => setHoveredItem('medidas')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'medidas'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Medidas<div className='recurso'>PR02</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['pr03']) && (
                                    <Link
                                        to={UrlLocal + '/config/product/assets'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Principios Activos')}
                                        onMouseEnter={() => setHoveredItem('principiosactivos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'principiosactivos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Principios Activos<div className='recurso'>PR03</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['pr04']) && (
                                    <Link
                                        to={UrlLocal + '/config/product/classes'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Clases')}
                                        onMouseEnter={() => setHoveredItem('clases')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'clases'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Clases<div className='recurso'>PR04</div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Seguridad */}
                    {tienePermisoRuta(['sc01', 'sc02', 'sc03', 'sc04', 'sc05', 'sc06', 'sc07', 'sc09']) && (
                        <div style={{ marginBottom: '8px' }}>
                            <button
                                onClick={() => toggleMenu('seguridad')}
                                onMouseEnter={() => setHoveredItem('seguridad')}
                                onMouseLeave={() => setHoveredItem(null)}
                                style={{
                                    ...menuItemStyle(hoveredItem === 'seguridad'),
                                    width: '100%',
                                    background: 'none',
                                    color: 'white',
                                    padding: '12px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                    className='colorSecundario'
                                >
                                    <i className="bi bi-shield-lock text-black"></i>
                                </div>
                                <span style={{ flex: 1, textAlign: 'left' }}>Seguridad</span>
                                <i className={`bi ${isSeguridadMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                            </button>
                            <div style={{
                                maxHeight: isSeguridadMenuOpen ? '500px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease',
                            }}>
                                {tienePermisoRuta(['sc01']) && (
                                    <Link
                                        to={UrlLocal + '/security/access'}
                                        onMouseEnter={() => setHoveredItem('accesos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'accesos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Accesos<div className='recurso'>SC01</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['sc02']) && (
                                    <Link
                                        to={UrlLocal + '/security/modules'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Modulos')}
                                        onMouseEnter={() => setHoveredItem('modulos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'modulos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Modulos<div className='recurso'>SC02</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['sc03']) && (
                                    <Link
                                        to={UrlLocal + '/security/roles'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Roles')}
                                        onMouseEnter={() => setHoveredItem('roles')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'roles'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Roles<div className='recurso'>SC03</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['sc04']) && (
                                    <Link
                                        to={UrlLocal + '/security/tokens'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Tokens')}
                                        onMouseEnter={() => setHoveredItem('tokens')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'tokens'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Tokens<div className='recurso'>SC04</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['sc05']) && (
                                    <Link
                                        to={UrlLocal + '/security/permissions'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Permisos')}
                                        onMouseEnter={() => setHoveredItem('permisos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'permisos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Permisos<div className='recurso'>SC05</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['sc06']) && (
                                    <Link
                                        to={UrlLocal + '/security/users'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Usuarios')}
                                        onMouseEnter={() => setHoveredItem('usuarios')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'usuarios'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Usuarios<div className='recurso'>SC06</div>
                                    </Link>
                                )}
                                {tienePermisoRuta(['sc09']) && (
                                    <Link
                                        to={UrlLocal + '/security/changepassword'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Contraseña')}
                                        onMouseEnter={() => setHoveredItem('contraseña')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'contraseña'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '5px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Contraseña<div className='recurso'>SC09</div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Separador */}
                    <div style={{
                        height: '1px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        margin: '16px 20px',
                    }}></div>

                    {/* Opciones de usuario */}
                    {tienePermisoRuta(['sc10']) && (
                        <Link
                            to={UrlLocal + '/company'}
                            onClick={async () => await AddAccess('Modificar', 0, userLog, 'Empresa')}
                            onMouseEnter={() => setHoveredItem('company')}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                ...menuItemStyle(hoveredItem === 'company'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 20px',
                                color: 'rgba(255, 255, 255, 0.8)',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px',
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                                className='colorSecundario'
                            >
                                <i className="bi bi-building text-black"></i>
                            </div>
                            Empresa<div className='recurso'>SC10</div>
                        </Link>
                    )}
                </nav>
            </div>

            {/* Footer del sidebar */}
            <div className='bg-dark' style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '12px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <button
                    onClick={handleLogoutClick}
                    onMouseEnter={() => setHoveredItem('logout')}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        width: '100%',
                        background: hoveredItem === 'logout' ? 'rgba(239, 68, 68, 0.2)' : 'none',
                        border: hoveredItem === 'logout' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: hoveredItem === 'logout' ? '#ef4444' : 'rgba(255, 255, 255, 0.8)',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <i className="bi bi-box-arrow-left"></i>
                    <span>Salir</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;