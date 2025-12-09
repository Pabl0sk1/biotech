import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AddAccess } from './utils/AddAccess.js';

const Sidebar = ({
    userLog,
    isSidebarVisible,
    toggleMenu,
    isSeguridadMenuOpen,
    isReportesMenuOpen,
    isRegistrosMenuOpen,
    handleLogoutClick,
    permisos
}) => {
    const UrlLocal = '/biotech/home';
    const [hoveredItem, setHoveredItem] = useState(null);

    const tienePermisoRuta = (moduloVar) => {
        if (!permisos) return false;

        return moduloVar.some(mod => {
            const permiso = permisos.find(
                p => p.modulo.var.toLowerCase().trim() === mod.toLowerCase().trim()
            );
            return permiso?.puedeconsultar === true;
        });
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
                    <div
                        style={{
                            width: '44px',
                            height: '44px',
                            background: 'linear-gradient(135deg, var(--color-secundario) 0%, var(--color-ternario) 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}
                    >
                        {userLog.nombreusuario?.charAt(0).toUpperCase()}
                    </div>
                    <div className='text-start'>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
                            {userLog.nombreusuario}
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
                    {/* Reportes */}
                    {tienePermisoRuta(['rp01']) && (
                        <div style={{ marginBottom: '8px' }}>
                            <button
                                onClick={() => toggleMenu('reportes')}
                                onMouseEnter={() => setHoveredItem('reportes')}
                                onMouseLeave={() => setHoveredItem(null)}
                                style={{
                                    ...menuItemStyle(hoveredItem === 'reportes'),
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
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <i className="bi bi-file-earmark-bar-graph" style={{ color: '#22c55e' }}></i>
                                </div>
                                <span style={{ flex: 1, textAlign: 'left' }}>Reportes</span>
                                <i className={`bi ${isReportesMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                            </button>

                            <div style={{
                                maxHeight: isReportesMenuOpen ? '200px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease',
                            }}>
                                {tienePermisoRuta(['rp01']) && (
                                    <Link
                                        to={UrlLocal + '/reports/calcext'}
                                        onClick={async () => await AddAccess('Realizar Informe', 0, userLog, 'Horas Extras')}
                                        onMouseEnter={() => setHoveredItem('horas-extras')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'horas-extras'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-clock-history" style={{ color: '#f59e0b' }}></i>
                                        Horas Extras
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Registros */}
                    {tienePermisoRuta(['rg01', 'rg02', 'rg03', 'rg04', 'rg05', 'rg06', 'rg07']) && (
                        <div style={{ marginBottom: '8px' }}>
                            <button
                                onClick={() => toggleMenu('registros')}
                                onMouseEnter={() => setHoveredItem('registros')}
                                onMouseLeave={() => setHoveredItem(null)}
                                style={{
                                    ...menuItemStyle(hoveredItem === 'registros'),
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
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <i className="bi bi-database" style={{ color: '#3b82f6' }}></i>
                                </div>
                                <span style={{ flex: 1, textAlign: 'left' }}>Registros</span>
                                <i className={`bi ${isRegistrosMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                            </button>

                            <div style={{
                                maxHeight: isRegistrosMenuOpen ? '300px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease',
                            }}>
                                {tienePermisoRuta(['rg01']) && (
                                    <Link
                                        to={UrlLocal + '/regs/employees'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Funcionarios')}
                                        onMouseEnter={() => setHoveredItem('funcionarios')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'funcionarios'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-people" style={{ color: '#06b6d4' }}></i>
                                        Funcionarios
                                    </Link>
                                )}
                                {tienePermisoRuta(['rg02']) && (
                                    <Link
                                        to={UrlLocal + '/regs/sellers'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Vendedores')}
                                        onMouseEnter={() => setHoveredItem('vendedores')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'vendedores'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-person-check" style={{ color: '#7ee963ff' }}></i>
                                        Vendedores
                                    </Link>
                                )}
                                {tienePermisoRuta(['rg03']) && (
                                    <Link
                                        to={UrlLocal + '/regs/branchs'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Sucursales')}
                                        onMouseEnter={() => setHoveredItem('sucursales')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'sucursales'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-building" style={{ color: '#f6cd5cff' }}></i>
                                        Sucursales
                                    </Link>
                                )}
                                {tienePermisoRuta(['rg04']) && (
                                    <Link
                                        to={UrlLocal + '/regs/positions'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Cargos')}
                                        onMouseEnter={() => setHoveredItem('cargos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'cargos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-briefcase" style={{ color: '#8b5cf6' }}></i>
                                        Cargos
                                    </Link>
                                )}
                                {tienePermisoRuta(['rg05']) && (
                                    <Link
                                        to={UrlLocal + '/regs/schedules'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Modalidades')}
                                        onMouseEnter={() => setHoveredItem('modalidades')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'modalidades'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-calendar-check" style={{ color: '#10b981' }}></i>
                                        Modalidades
                                    </Link>
                                )}
                                {tienePermisoRuta(['rg06']) && (
                                    <Link
                                        to={UrlLocal + '/regs/modules'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Modulos')}
                                        onMouseEnter={() => setHoveredItem('modulos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'modulos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-box" style={{ color: '#d75cf6ff' }}></i>
                                        Modulos
                                    </Link>
                                )}
                                {tienePermisoRuta(['rg07']) && (
                                    <Link
                                        to={UrlLocal + '/regs/shifts'}
                                        onClick={async () => await AddAccess('Consultar', 0, userLog, 'Turnos')}
                                        onMouseEnter={() => setHoveredItem('turnos')}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={{
                                            ...subMenuItemStyle(hoveredItem === 'turnos'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-arrow-repeat" style={{ color: '#f97316' }}></i>
                                        Turnos
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Seguridad */}
                    {tienePermisoRuta(['sc01', 'sc02', 'sc03', 'sc04', 'sc05']) && (
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
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <i className="bi bi-shield-lock" style={{ color: '#ef4444' }}></i>
                                </div>
                                <span style={{ flex: 1, textAlign: 'left' }}>Seguridad</span>
                                <i className={`bi ${isSeguridadMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                            </button>

                            <div style={{
                                maxHeight: isSeguridadMenuOpen ? '200px' : '0',
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
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-key" style={{ color: '#f59e0b' }}></i>
                                        Accesos
                                    </Link>
                                )}
                                {tienePermisoRuta(['sc02']) && (
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
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-person-gear" style={{ color: '#3b82f6' }}></i>
                                        Usuarios
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
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-diagram-3" style={{ color: '#8b5cf6' }}></i>
                                        Roles
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
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-asterisk" style={{ color: '#88e6ceff' }}></i>
                                        Tokens
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
                                            padding: '10px 20px 10px 52px',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <i className="bi bi-award" style={{ color: '#3bf6aeff' }}></i>
                                        Permisos
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
                    {tienePermisoRuta(['ma01']) && (
                        <Link
                            to={UrlLocal + '/profile'}
                            onClick={async () => await AddAccess('Modificar', 0, userLog, 'Perfil')}
                            onMouseEnter={() => setHoveredItem('perfil')}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                ...menuItemStyle(hoveredItem === 'perfil'),
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
                                background: 'rgba(168, 85, 247, 0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <i className="bi bi-person-circle" style={{ color: '#a855f7' }}></i>
                            </div>
                            <span>Perfil</span>
                        </Link>
                    )}
                    {tienePermisoRuta(['ma02']) && (
                        <Link
                            to={UrlLocal + '/changepassword'}
                            onClick={async () => await AddAccess('Modificar', 0, userLog, 'Contraseña')}
                            onMouseEnter={() => setHoveredItem('password')}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                ...menuItemStyle(hoveredItem === 'password'),
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
                                background: 'rgba(245, 158, 11, 0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <i className="bi bi-key" style={{ color: '#f59e0b' }}></i>
                            </div>
                            <span>Contraseña</span>
                        </Link>
                    )}
                    {tienePermisoRuta(['ma03']) && (
                        <Link
                            to={UrlLocal + '/config'}
                            onClick={async () => await AddAccess('Modificar', 0, userLog, 'Configuración')}
                            onMouseEnter={() => setHoveredItem('config')}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                ...menuItemStyle(hoveredItem === 'config'),
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
                                background: 'rgba(107, 114, 128, 0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <i className="bi bi-gear" style={{ color: '#6b7280' }}></i>
                            </div>
                            <span>Configuración</span>
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