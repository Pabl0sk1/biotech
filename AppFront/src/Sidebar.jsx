import { Link } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = ({
    usuarioUsed,
    isSidebarVisible,
    toggleSeguridadMenu,
    toggleReportesMenu,
    toggleRegistrosMenu,
    isSeguridadMenuOpen,
    isReportesMenuOpen,
    isRegistrosMenuOpen,
    agregarAcceso,
    handleLogoutClick,
    UrlLocal
}) => {
    const [hoveredItem, setHoveredItem] = useState(null);

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
                        {usuarioUsed.nombreusuario?.charAt(0).toUpperCase()}
                    </div>
                    <div className='text-start'>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
                            {usuarioUsed.nombreusuario}
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
                    <div style={{ marginBottom: '8px' }}>
                        <button
                            onClick={toggleReportesMenu}
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
                            <i className={`bi ${isReportesMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                                style={{
                                    transition: 'transform 0.3s ease',
                                    transform: isReportesMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}
                            ></i>
                        </button>

                        <div style={{
                            maxHeight: isReportesMenuOpen ? '200px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease',
                        }}>
                            {usuarioUsed?.tipousuario?.id && [1, 2, 5].includes(usuarioUsed.tipousuario.id) && (
                                <Link
                                    to="#"
                                    onClick={() => agregarAcceso('Horas Extras', 'Realizar Informe', UrlLocal + '/reports/calcext')}
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

                    {/* Registros */}
                    <div style={{ marginBottom: '8px' }}>
                        <button
                            onClick={toggleRegistrosMenu}
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
                            <i className={`bi ${isRegistrosMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                                style={{
                                    transition: 'transform 0.3s ease',
                                    transform: isRegistrosMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}
                            ></i>
                        </button>

                        <div style={{
                            maxHeight: isRegistrosMenuOpen ? '300px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease',
                        }}>
                            {usuarioUsed?.tipousuario?.id && [1, 2, 5].includes(usuarioUsed.tipousuario.id) && (
                                <>
                                    <Link
                                        to="#"
                                        onClick={() => agregarAcceso('Cargos', 'Consultar', UrlLocal + '/regs/positions')}
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
                                    <Link
                                        to="#"
                                        onClick={() => agregarAcceso('Funcionarios', 'Consultar', UrlLocal + '/regs/employees')}
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
                                </>
                            )}

                            {usuarioUsed?.tipousuario?.id && [1, 9].includes(usuarioUsed.tipousuario.id) && (
                                <>
                                    <Link
                                        to="#"
                                        onClick={() => agregarAcceso('Vendedores', 'Consultar', UrlLocal + '/regs/sellers')}
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
                                </>
                            )}

                            {usuarioUsed?.tipousuario?.id && [1].includes(usuarioUsed.tipousuario.id) && (
                                <>
                                    <Link
                                        to="#"
                                        onClick={() => agregarAcceso('Modalidades', 'Consultar', UrlLocal + '/regs/schedules')}
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
                                    <Link
                                        to="#"
                                        onClick={() => agregarAcceso('Turnos', 'Consultar', UrlLocal + '/regs/shifts')}
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
                                </>
                            )}
                        </div>
                    </div>

                    {/* Seguridad */}
                    {usuarioUsed?.tipousuario?.id && [1, 5].includes(usuarioUsed.tipousuario.id) && (
                        <div style={{ marginBottom: '8px' }}>
                            <button
                                onClick={toggleSeguridadMenu}
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
                                <i className={`bi ${isSeguridadMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                                    style={{
                                        transition: 'transform 0.3s ease',
                                        transform: isSeguridadMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                ></i>
                            </button>

                            <div style={{
                                maxHeight: isSeguridadMenuOpen ? '200px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease',
                            }}>
                                {[1, 5].includes(usuarioUsed.tipousuario.id) && (
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
                                {[1].includes(usuarioUsed.tipousuario.id) && (
                                    <>
                                        <Link
                                            to="#"
                                            onClick={() => agregarAcceso('Usuarios', 'Consultar', UrlLocal + '/security/users')}
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
                                        <Link
                                            to="#"
                                            onClick={() => agregarAcceso('Roles', 'Consultar', UrlLocal + '/security/roles')}
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
                                        <Link
                                            to="#"
                                            onClick={() => agregarAcceso('Tokens', 'Consultar', UrlLocal + '/security/tokens')}
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
                                    </>
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
                    <Link
                        to="#"
                        onClick={() => agregarAcceso('Perfil', 'Modificar', UrlLocal + '/profile')}
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

                    <Link
                        to="#"
                        onClick={() => agregarAcceso('Contraseña', 'Modificar', UrlLocal + '/changepassword')}
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

                    {usuarioUsed?.tipousuario?.id && [1].includes(usuarioUsed.tipousuario.id) && (
                        <Link
                            to="#"
                            onClick={() => agregarAcceso('Configuración', 'Modificar', UrlLocal + '/config')}
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