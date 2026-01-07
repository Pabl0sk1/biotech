import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AddAccess } from './utils/AddAccess.js';
import { getMenu } from './services/menu.service.js';
import { HostLocation } from './utils/HostLocation';
import { tieneAccesoModulo } from './utils/RouteAccess.js';
import { getPermission } from './services/permiso.service.js';

const Sidebar = ({ userLog, isSidebarVisible, handleLogoutClick }) => {
    const UrlLocal = '/home';

    const [avatar, setAvatar] = useState(null);
    const [permisos, setPermisos] = useState({});

    useEffect(() => {
        if (!userLog?.tipousuario?.id) return;

        const loadPermisos = async () => {
            const id = userLog?.tipousuario?.id;
            const response = await getPermission('', '', '', `tipousuario.id:eq:${id}`);
            const result = response.items;

            setPermisos({
                perfil: {
                    ok: tieneAccesoModulo(['sc08'], result),
                },
                principal: {
                    comercial: {
                        ok: tieneAccesoModulo(['cm03'], result),
                        planeamiento: tieneAccesoModulo(['cm03'], result),
                    },
                    rrhh: {
                        ok: tieneAccesoModulo(['rh04'], result),
                        horasextras: tieneAccesoModulo(['rh04'], result),
                    }
                },
                catastros: {
                    ok: tieneAccesoModulo(['ca01', 'ca02'], result),
                    entidades: tieneAccesoModulo(['ca01'], result),
                    productos: tieneAccesoModulo(['ca02'], result),
                },
                configuraciones: {
                    generales: {
                        ok: tieneAccesoModulo(['gr01', 'gr02', 'gr03', 'gr04', 'gr05', 'gr06'], result),
                        fasecultivos: tieneAccesoModulo(['gr01'], result),
                        monedas: tieneAccesoModulo(['gr02'], result),
                        sucursales: tieneAccesoModulo(['gr03'], result),
                        tributaciones: tieneAccesoModulo(['gr04'], result),
                        zafras: tieneAccesoModulo(['gr05'], result),
                        categorias: tieneAccesoModulo(['gr06'], result),
                    },
                    rrhh: {
                        ok: tieneAccesoModulo(['rh01', 'rh02', 'rh03'], result),
                        cargos: tieneAccesoModulo(['rh01'], result),
                        modalidades: tieneAccesoModulo(['rh02'], result),
                        turnos: tieneAccesoModulo(['rh03'], result),
                    },
                    comerciales: {
                        ok: tieneAccesoModulo(['cm01', 'cm02'], result),
                        carteras: tieneAccesoModulo(['cm01'], result),
                        nombrecomerciales: tieneAccesoModulo(['cm02'], result),
                    },
                    productos: {
                        ok: tieneAccesoModulo(['pr01', 'pr02', 'pr03', 'pr04'], result),
                        grupoproductos: tieneAccesoModulo(['pr01'], result),
                        medidas: tieneAccesoModulo(['pr02'], result),
                        principioactivos: tieneAccesoModulo(['pr03'], result),
                        clases: tieneAccesoModulo(['pr04'], result),
                    }
                },
                seguridad: {
                    ok: tieneAccesoModulo(['sc01', 'sc02', 'sc03', 'sc04', 'sc05', 'sc06', 'sc07', 'sc09'], result),
                    accesos: tieneAccesoModulo(['sc01'], result),
                    modulos: tieneAccesoModulo(['sc02'], result),
                    roles: tieneAccesoModulo(['sc03'], result),
                    tokens: tieneAccesoModulo(['sc04'], result),
                    permisos: tieneAccesoModulo(['sc05'], result),
                    usuarios: tieneAccesoModulo(['sc06'], result),
                    menus: tieneAccesoModulo(['sc07'], result),
                    contrasenha: tieneAccesoModulo(['sc09'], result),
                },
                empresa: {
                    ok: tieneAccesoModulo(['sc10'], result),
                },
            });
        };

        loadPermisos();
    }, [userLog]);

    useEffect(() => {
        const load = async () => {
            const response = await getMenu();
        }
        load();

        const BACKEND_URL = HostLocation(1);
        if (userLog?.imagenurl) setAvatar(BACKEND_URL + "/biotech" + userLog?.imagenurl);
    }, []);

    const menuConfig = [
        {
            id: 'principal',
            label: 'Principal',
            icon: 'bi-house',
            permission:
                permisos.principal?.comercial?.ok ||
                permisos.principal?.rrhh?.ok,
            items: [
                {
                    label: 'Comercial',
                    permission: permisos.principal?.comercial?.ok,
                    children: [
                        {
                            label: 'Planeamiento',
                            path: '/main/commercial/planning',
                            code: 'CM03',
                            permission: permisos.principal?.comercial?.planeamiento,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Planeamiento')
                        }
                    ]
                },
                {
                    label: 'RRHH',
                    permission: permisos.principal?.rrhh?.ok,
                    children: [
                        {
                            label: 'Horas Extras',
                            path: '/main/rrhh/calcext',
                            code: 'RH04',
                            permission: permisos.principal?.rrhh?.horasextras,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Horas Extras')
                        }
                    ]
                }
            ]
        },
        {
            id: 'catastros',
            label: 'Catastros',
            icon: 'bi-box',
            permission: permisos.catastros?.ok,
            items: [
                {
                    label: 'Entidades',
                    path: '/cadastres/entities',
                    code: 'CA01',
                    permission: permisos.catastros?.entidades,
                    onClick: () => AddAccess('Consultar', 0, userLog, 'Entidades')
                },
                {
                    label: 'Productos',
                    path: '/cadastres/products',
                    code: 'CA02',
                    permission: permisos.catastros?.productos,
                    onClick: () => AddAccess('Consultar', 0, userLog, 'Productos')
                }
            ]
        },
        {
            id: 'configuraciones',
            label: 'Configuración',
            icon: 'bi-gear',
            permission:
                permisos.configuraciones?.generales?.ok ||
                permisos.configuraciones?.rrhh?.ok ||
                permisos.configuraciones?.comerciales?.ok ||
                permisos.configuraciones?.productos?.ok,
            items: [
                {
                    label: 'General',
                    permission: permisos.configuraciones?.generales?.ok,
                    children: [
                        {
                            label: 'Fases de Cultivos',
                            path: '/config/general/crops',
                            code: 'GR01',
                            permission: permisos.configuraciones?.generales?.fasecultivos,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Fases de Cultivos')
                        },
                        {
                            label: 'Monedas',
                            path: '/config/general/currencies',
                            code: 'GR02',
                            permission: permisos.configuraciones?.generales?.monedas,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Monedas')
                        },
                        {
                            label: 'Sucursales',
                            path: '/config/general/branchs',
                            code: 'GR03',
                            permission: permisos.configuraciones?.generales?.sucursales,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Sucursales')
                        },
                        {
                            label: 'Tributaciones',
                            path: '/config/general/taxations',
                            code: 'GR04',
                            permission: permisos.configuraciones?.generales?.tributaciones,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Tributaciones')
                        },
                        {
                            label: 'Zafras',
                            path: '/config/general/harvests',
                            code: 'GR05',
                            permission: permisos.configuraciones?.generales?.zafras,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Zafras')
                        },
                        {
                            label: 'Categorías',
                            path: '/config/general/categories',
                            code: 'GR06',
                            permission: permisos.configuraciones?.generales?.categorias,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Categorías')
                        }
                    ]
                },
                {
                    label: 'RRHH',
                    permission: permisos.configuraciones?.rrhh?.ok,
                    children: [
                        {
                            label: 'Cargos',
                            path: '/config/rrhh/positions',
                            code: 'RH01',
                            permission: permisos.configuraciones?.rrhh?.cargos,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Cargos')
                        },
                        {
                            label: 'Modalidades',
                            path: '/config/rrhh/schedules',
                            code: 'RH02',
                            permission: permisos.configuraciones?.rrhh?.modalidades,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Modalidades')
                        },
                        {
                            label: 'Turnos',
                            path: '/config/rrhh/shifts',
                            code: 'RH03',
                            permission: permisos.configuraciones?.rrhh?.turnos,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Turnos')
                        }
                    ]
                },
                {
                    label: 'Comercial',
                    permission: permisos.configuraciones?.comerciales?.ok,
                    children: [
                        {
                            label: 'Carteras',
                            path: '/config/commercial/wallets',
                            code: 'CM01',
                            permission: permisos.configuraciones?.comerciales?.carteras,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Carteras')
                        },
                        {
                            label: 'Nombres Comerciales',
                            path: '/config/commercial/tradenames',
                            code: 'CM02',
                            permission: permisos.configuraciones?.comerciales?.nombrecomerciales,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Nombres Comerciales')
                        }
                    ]
                },
                {
                    label: 'Producto',
                    permission: permisos.configuraciones?.productos?.ok,
                    children: [
                        {
                            label: 'Grupos de Productos',
                            path: '/config/product/productgroups',
                            code: 'PR01',
                            permission: permisos.configuraciones?.productos?.grupoproductos,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Grupos de Productos')
                        },
                        {
                            label: 'Medidas',
                            path: '/config/product/measures',
                            code: 'PR02',
                            permission: permisos.configuraciones?.productos?.medidas,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Medidas')
                        },
                        {
                            label: 'Principios Activos',
                            path: '/config/product/assets',
                            code: 'PR03',
                            permission: permisos.configuraciones?.productos?.principioactivos,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Principios Activos')
                        },
                        {
                            label: 'Clases',
                            path: '/config/product/classes',
                            code: 'PR04',
                            permission: permisos.configuraciones?.productos?.clases,
                            onClick: () => AddAccess('Consultar', 0, userLog, 'Clases')
                        }
                    ]
                }
            ]
        },
        {
            id: 'seguridad',
            label: 'Seguridad',
            icon: 'bi-shield-lock',
            permission: permisos.seguridad?.ok,
            items: [
                {
                    label: 'Accesos',
                    path: '/security/access',
                    code: 'SC01',
                    permission: permisos.seguridad?.accesos,
                    onClick: () => AddAccess('Consultar', 0, userLog, 'Accesos')
                },
                {
                    label: 'Modulos',
                    path: '/security/modules',
                    code: 'SC02',
                    permission: permisos.seguridad?.modulos,
                    onClick: () => AddAccess('Consultar', 0, userLog, 'Modulos')
                },
                {
                    label: 'Roles',
                    path: '/security/roles',
                    code: 'SC03',
                    permission: permisos.seguridad?.roles,
                    onClick: () => AddAccess('Consultar', 0, userLog, 'Roles')
                },
                {
                    label: 'Tokens',
                    path: '/security/tokens',
                    code: 'SC04',
                    permission: permisos.seguridad?.tokens,
                    onClick: () => AddAccess('Consultar', 0, userLog, 'Tokens')
                },
                {
                    label: 'Permisos',
                    path: '/security/permissions',
                    code: 'SC05',
                    permission: permisos.seguridad?.permisos,
                    onClick: () => AddAccess('Consultar', 0, userLog, 'Permisos')
                },
                {
                    label: 'Usuarios',
                    path: '/security/users',
                    code: 'SC06',
                    permission: permisos.seguridad?.usuarios,
                    onClick: () => AddAccess('Consultar', 0, userLog, 'Usuarios')
                },
                {
                    label: 'Contraseña',
                    path: '/security/changepassword',
                    code: 'SC09',
                    permission: permisos.seguridad?.contrasenha,
                    onClick: () => AddAccess('Consultar', 0, userLog, 'Contraseña')
                }
            ]
        }
    ];

    const getSubmenuPosition = (index) => {
        const headerHeight = 130;
        const itemHeight = 72;
        return headerHeight + (index * itemHeight);
    };

    const hasNestedChildren = (items) => {
        return items.some(item => item.children && item.children.length > 0);
    };

    return (
        <div className={`sidebar-modern ${isSidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}>
            {/* Header */}
            <div className="sidebar-header">
                <Link
                    className="sidebar-avatar"
                    to={permisos.perfil?.ok ? UrlLocal + '/profile' : ''}
                    onClick={() => {
                        if (permisos.perfil?.ok) AddAccess('Modificar', 0, userLog, 'Perfil');
                    }}
                    style={{ cursor: permisos.perfil?.ok ? 'pointer' : 'default' }}
                >
                    {avatar ? (
                        <img
                            src={avatar}
                            alt="Perfil"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        userLog?.nombreusuario?.charAt(0).toUpperCase()
                    )}
                </Link>
            </div>

            {/* Contenido del menú */}
            <div className="sidebar-content">
                <nav>
                    {menuConfig.map((menu, index) => {
                        if (!menu.permission) return null;

                        const hasNested = hasNestedChildren(menu.items);

                        return (
                            <div key={menu.id} className="menu-item">
                                <button className="menu-item-button">
                                    <div className={`menu-icon colorSecundario`}>
                                        <i className={`bi ${menu.icon} text-black`}></i>
                                    </div>
                                    <span className="menu-label">{menu.label}</span>
                                </button>

                                {/* Submenu flotante */}
                                <div
                                    className="submenu-floating"
                                    style={{ top: `${getSubmenuPosition(index)}px` }}
                                >
                                    <div className="submenu-content">
                                        {hasNested ? (
                                            // Menú con submenús anidados (mostrar secciones)
                                            menu.items.map((section) => {
                                                if (!section.permission) return null;

                                                return (
                                                    <div key={section.label} className="submenu-section-wrapper">
                                                        <div className="submenu-section-item">
                                                            {section.label}
                                                        </div>

                                                        {/* Submenu de rutas (aparece a la derecha) */}
                                                        <div className="submenu-routes">
                                                            <div className="submenu-routes-content">
                                                                {section.children?.map((item) => {
                                                                    if (!item.permission) return null;

                                                                    return (
                                                                        <Link
                                                                            key={item.code}
                                                                            to={UrlLocal + item.path}
                                                                            onClick={async () => {
                                                                                if (item.onClick) await item.onClick();
                                                                            }}
                                                                            className="submenu-route-link"
                                                                        >
                                                                            <span>{item.label}</span>
                                                                            <div className="recurso">{item.code}</div>
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            // Menú sin submenús (mostrar rutas directamente)
                                            menu.items.map((item) => {
                                                if (!item.permission) return null;

                                                return (
                                                    <Link
                                                        key={item.code}
                                                        to={UrlLocal + item.path}
                                                        onClick={async () => {
                                                            if (item.onClick) await item.onClick();
                                                        }}
                                                        className="submenu-direct-link"
                                                    >
                                                        <span>{item.label}</span>
                                                        <div className="recurso">{item.code}</div>
                                                    </Link>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Separador */}
                    <div className="sidebar-separator"></div>

                    {/* Empresa */}
                    {permisos.empresa?.ok && (
                        <Link
                            to={UrlLocal + '/company'}
                            onClick={async () => await AddAccess('Modificar', 0, userLog, 'Empresa')}
                            className="menu-item-single"
                        >
                            <div className="menu-icon colorSecundario">
                                <i className="bi bi-building text-black"></i>
                            </div>
                            <span className="menu-label">Empresa</span>
                        </Link>
                    )}
                </nav>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <button onClick={handleLogoutClick} className="logout-button">
                    <i className="bi bi-box-arrow-left"></i>
                    <span>Salir</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
