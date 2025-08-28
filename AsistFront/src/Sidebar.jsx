import { Link } from 'react-router-dom';

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
    return (
        <div
            className={`col-2 bg-dark p-0 vh-100 pt-5 overflow-x-auto mt-2 ${isSidebarVisible ? '' : 'd-none'
                } user-select-none`}
            style={{ fontSize: '14px' }}
        >
            <div className="d-flex flex-column text-white">
                <ul className="nav flex-column fw-bold text-start">
                    {/* Usuario */}
                    <li className="d-flex nav-item pb-1 pt-2 ps-3">
                        <i className="bi bi-person me-2"></i>
                        <p className="m-0 usuarioNombre">{usuarioUsed.nombreusuario}</p>
                    </li>

                    {/* Reportes */}
                    <li className="nav-item">
                        <a
                            role="button"
                            onClick={toggleReportesMenu}
                            className="d-flex w-100 align-items-center ps-0 pt-2 pb-2 link-light menuTitle"
                        >
                            <i className="bi bi-file-earmark-text ps-3 pe-2"></i>
                            Reportes
                            <span className="ms-auto me-3">
                                <i
                                    className={`bi ${isReportesMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'
                                        }`}
                                ></i>
                            </span>
                        </a>
                        <ul
                            className={`nav collapse menuSubtitle fw-normal ${isReportesMenuOpen ? 'show' : ''
                                }`}
                        >
                            {usuarioUsed?.tipousuario?.id &&
                                [1, 2, 5].includes(usuarioUsed.tipousuario.id) && (
                                    <li className="nav-item menuSubtitleItem ps-4 w-100">
                                        <Link
                                            onClick={() =>
                                                agregarAcceso(
                                                    'Horas Extras',
                                                    'Realizar Informe',
                                                    UrlLocal + '/reports/calcext'
                                                )
                                            }
                                            className="nav-link text-white p-1"
                                        >
                                            Horas Extras
                                        </Link>
                                    </li>
                                )}
                        </ul>
                    </li>

                    {/* Registros */}
                    <li className="nav-item">
                        <a
                            role="button"
                            onClick={toggleRegistrosMenu}
                            className="d-flex w-100 align-items-center ps-0 pt-2 pb-2 link-light menuTitle"
                        >
                            <i className="bi bi-patch-plus ps-3 pe-2"></i>
                            Registros
                            <span className="ms-auto me-3">
                                <i
                                    className={`bi ${isRegistrosMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'
                                        }`}
                                ></i>
                            </span>
                        </a>
                        <ul
                            className={`nav collapse menuSubtitle fw-normal ${isRegistrosMenuOpen ? 'show' : ''
                                }`}
                        >
                            {usuarioUsed?.tipousuario?.id &&
                                [1, 2, 5].includes(usuarioUsed.tipousuario.id) && (
                                    <>
                                        <li className="nav-item menuSubtitleItem ps-4 w-100">
                                            <Link
                                                onClick={() =>
                                                    agregarAcceso(
                                                        'Cargos',
                                                        'Consultar',
                                                        UrlLocal + '/regs/positions'
                                                    )
                                                }
                                                className="nav-link text-white p-1"
                                            >
                                                Cargos
                                            </Link>
                                        </li>
                                        <li className="nav-item menuSubtitleItem ps-4 w-100">
                                            <Link
                                                onClick={() =>
                                                    agregarAcceso(
                                                        'Funcionarios',
                                                        'Consultar',
                                                        UrlLocal + '/regs/employees'
                                                    )
                                                }
                                                className="nav-link text-white p-1"
                                            >
                                                Funcionarios
                                            </Link>
                                        </li>
                                    </>
                                )}

                            {usuarioUsed?.tipousuario?.id &&
                                [1].includes(usuarioUsed.tipousuario.id) && (
                                    <>
                                        <li className="nav-item menuSubtitleItem ps-4 w-100">
                                            <Link
                                                onClick={() =>
                                                    agregarAcceso(
                                                        'Modalidades',
                                                        'Consultar',
                                                        UrlLocal + '/regs/schedules'
                                                    )
                                                }
                                                className="nav-link text-white p-1"
                                            >
                                                Modalidades
                                            </Link>
                                        </li>
                                        <li className="nav-item menuSubtitleItem ps-4 w-100">
                                            <Link
                                                onClick={() =>
                                                    agregarAcceso(
                                                        'Turnos',
                                                        'Consultar',
                                                        UrlLocal + '/regs/shifts'
                                                    )
                                                }
                                                className="nav-link text-white p-1"
                                            >
                                                Turnos
                                            </Link>
                                        </li>
                                    </>
                                )}
                        </ul>
                    </li>

                    {/* Seguridad */}
                    {usuarioUsed?.tipousuario?.id &&
                        [1, 5].includes(usuarioUsed.tipousuario.id) && (
                            <li className="nav-item">
                                <a
                                    role="button"
                                    onClick={toggleSeguridadMenu}
                                    className="d-flex w-100 align-items-center ps-0 pt-2 pb-2 link-light menuTitle"
                                >
                                    <i className="bi bi-lock ps-3 pe-2"></i>
                                    Seguridad
                                    <span className="ms-auto me-3">
                                        <i
                                            className={`bi ${isSeguridadMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'
                                                }`}
                                        ></i>
                                    </span>
                                </a>
                                <ul
                                    className={`nav collapse menuSubtitle fw-normal ${isSeguridadMenuOpen ? 'show' : ''
                                        }`}
                                >
                                    {[1, 5].includes(usuarioUsed.tipousuario.id) && (
                                        <li className="nav-item menuSubtitleItem ps-4 w-100">
                                            <Link
                                                to={UrlLocal + '/security/access'}
                                                className="nav-link text-white p-1"
                                            >
                                                Accesos
                                            </Link>
                                        </li>
                                    )}
                                    {[1].includes(usuarioUsed.tipousuario.id) && (
                                        <>
                                            <li className="nav-item menuSubtitleItem ps-4 w-100">
                                                <Link
                                                    onClick={() =>
                                                        agregarAcceso(
                                                            'Usuarios',
                                                            'Consultar',
                                                            UrlLocal + '/security/users'
                                                        )
                                                    }
                                                    className="nav-link text-white p-1"
                                                >
                                                    Usuarios
                                                </Link>
                                            </li>
                                            <li className="nav-item menuSubtitleItem ps-4 w-100">
                                                <Link
                                                    onClick={() =>
                                                        agregarAcceso(
                                                            'Roles',
                                                            'Consultar',
                                                            UrlLocal + '/security/roles'
                                                        )
                                                    }
                                                    className="nav-link text-white p-1"
                                                >
                                                    Roles
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </li>
                        )}

                    {/* Otros */}
                    <li className="nav-item menuTitle">
                        <Link
                            className="nav-link text-white"
                            onClick={() =>
                                agregarAcceso('Perfil', 'Modificar', UrlLocal + '/profile')
                            }
                        >
                            <i className="bi bi-person-circle me-2"></i>
                            Perfil
                        </Link>
                    </li>
                    <li className="nav-item menuTitle">
                        <Link
                            className="nav-link text-white"
                            onClick={() =>
                                agregarAcceso(
                                    'Contraseña',
                                    'Modificar',
                                    UrlLocal + '/changepassword'
                                )
                            }
                        >
                            <i className="bi bi-key me-2"></i>
                            Contraseña
                        </Link>
                    </li>
                    {usuarioUsed?.tipousuario?.id &&
                        [1].includes(usuarioUsed.tipousuario.id) && (
                            <li className="nav-item menuTitle">
                                <Link
                                    className="nav-link text-white"
                                    onClick={() =>
                                        agregarAcceso(
                                            'Configuración',
                                            'Modificar',
                                            UrlLocal + '/config'
                                        )
                                    }
                                >
                                    <i className="bi bi-gear me-2"></i>
                                    Configuración
                                </Link>
                            </li>
                        )}
                    <li className="nav-item menuTitle">
                        <Link className="nav-link text-white" onClick={handleLogoutClick}>
                            <i className="bi bi-chevron-double-left me-2"></i>
                            Salir
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
