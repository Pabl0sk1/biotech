import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AddAccess } from './utils/AddAccess.js';
import { getMenu } from './services/menu.service.js';
import { HostLocation } from './utils/HostLocation';
import { tieneAccesoModulo } from './utils/RouteAccess.js';
import { getPermission } from './services/permiso.service.js';
import { updateUser } from './services/usuario.service.js';
import LogoutModal from './layouts/LogoutModal.jsx';
import Loading from './layouts/Loading.jsx';

const Sidebar = ({ userLog, setUserLog, isSidebarVisible }) => {
    const UrlLocal = '/home';

    const navigate = useNavigate();
    const [avatar, setAvatar] = useState(null);
    const [menus, setMenus] = useState([]);
    const [permisos, setPermisos] = useState([]);
    const [menuPerfil, setMenuPerfil] = useState({});
    const [permisoPerfil, setPermisoPerfil] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        if (!userLog?.tipousuario?.id) return;

        const loadAll = async () => {
            setLoading(true);

            try {
                const idRol = userLog?.tipousuario?.id;

                const [
                    menuRes,
                    menuPerfilRes,
                    permisosRes,
                    permisoPerfilRes
                ] = await Promise.all([
                    getMenu('', '', 'orden,asc', 'activo:eq:true'),
                    getMenu('', '', '', 'id:eq:4'),
                    getPermission('', '', '', `tipousuario.id:eq:${idRol};puedeconsultar:eq:true`),
                    getPermission('', '', '', `tipousuario.id:eq:${idRol};puedeconsultar:eq:true;modulo.var:eq:sc08`)
                ]);

                setMenus(menuRes.items);
                setMenuPerfil(menuPerfilRes.items[0].programas[0]);

                setPermisos(permisosRes.items);
                setPermisoPerfil(permisoPerfilRes.items[0] ? true : false);

                const BACKEND_URL = HostLocation(1);
                if (userLog?.imagenurl) setAvatar(BACKEND_URL + "/biotech" + userLog?.imagenurl);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, [userLog]);

    const confirmLogout = async () => {
        setShowLogoutModal(false);
        setLoading(true);

        try {
            localStorage.removeItem('session');
            sessionStorage.removeItem('usuario');

            const usuario = {
                ...userLog,
                online: false
            };

            await AddAccess('Cerrar Sesión', 0, userLog, 'Login');
            await updateUser(usuario.id, usuario);

            setUserLog(null);
            navigate('/biotech/login');

        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const parseRecursos = (r) => r?.split(',').map(x => x.trim().toLowerCase()) ?? [];

    return (
        <>

            {loading && (
                <Loading />
            )}
            {showLogoutModal && (
                <LogoutModal confirm={confirmLogout} setClose={setShowLogoutModal} />
            )}

            <div className={`sidebar-modern z-7 ${isSidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}>
                {/* Header */}
                <div className="sidebar-header">
                    <Link
                        className="sidebar-avatar"
                        to={permisoPerfil ? UrlLocal + menuPerfil.ruta : ''}
                        onClick={async () => {
                            await AddAccess('Modificar', 0, userLog, menuPerfil.nombre);
                        }}
                        style={{ cursor: permisoPerfil ? 'pointer' : 'default' }}
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
                <div className="sidebar-content" >
                    <nav className='mb-4'>
                        {menus.map((m) => {
                            if (!tieneAccesoModulo(parseRecursos(m.recursos), permisos)) return null;

                            return (
                                <div key={m.id} className="menu-item">
                                    {m && !m.unico ? (
                                        <>
                                            <button className="menu-item-button">
                                                <div className={`menu-icon colorSecundario`}>
                                                    <i className={`bi ${m.icono} text-black`}></i>
                                                </div>
                                                <span className="menu-label">{m.menu}</span>
                                            </button>

                                            {/* Submenu flotante */}
                                            <div className="submenu-floating">
                                                <div className="submenu-content">
                                                    {m.submenus && m.submenus.length > 0 ? (
                                                        // Menú con submenús anidados (mostrar secciones)
                                                        m.submenus.filter(s => s.activo).sort((a, b) => a.orden - b.orden).map((s) => {
                                                            if (!tieneAccesoModulo(parseRecursos(s.recursos), permisos)) return null;

                                                            return (
                                                                <div key={s.submenu} className="submenu-section-wrapper">
                                                                    <div className="submenu-section-item">
                                                                        {s.submenu}
                                                                        <i className='bi bi-arrow-right-short'></i>
                                                                    </div>

                                                                    {/* Submenu de rutas (aparece a la derecha) */}
                                                                    <div className="submenu-routes">
                                                                        <div className="submenu-routes-content">
                                                                            {s.programas.filter(p => p.activo).sort((a, b) => a.orden - b.orden).map((p) => {
                                                                                if (!tieneAccesoModulo([p?.modulo?.var?.toLowerCase()], permisos)) return null;

                                                                                return (
                                                                                    <Link
                                                                                        key={p.modulo.var}
                                                                                        to={UrlLocal + p.ruta}
                                                                                        onClick={async () => {
                                                                                            if (p.id != 8 && p.id != 3) await AddAccess('Consultar', 0, userLog, p.nombre);
                                                                                            else if (p.id == 3) await AddAccess('Modificar', 0, userLog, p.nombre);
                                                                                        }}
                                                                                        className="submenu-route-link"
                                                                                    >
                                                                                        <span>{p.nombre}</span>
                                                                                        <div className="recurso">{p.modulo.var}</div>
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
                                                        m.programas.filter(p => p.activo && p.id != 4).sort((a, b) => a.orden - b.orden).map((p) => {
                                                            if (!tieneAccesoModulo([p?.modulo?.var?.toLowerCase()], permisos)) return null;

                                                            return (
                                                                <Link
                                                                    key={p.modulo.var}
                                                                    to={UrlLocal + p.ruta}
                                                                    onClick={async () => {
                                                                        if (p.id != 8 && p.id != 3) await AddAccess('Consultar', 0, userLog, p.nombre);
                                                                        else if (p.id == 3) await AddAccess('Modificar', 0, userLog, p.nombre);
                                                                    }}
                                                                    className="submenu-direct-link"
                                                                >
                                                                    <span>{p.nombre}</span>
                                                                    <div className="recurso">{p.modulo.var}</div>
                                                                </Link>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        m.programas.filter(p => p.activo && p.id != 4).sort((a, b) => a.orden - b.orden).map((p) => {
                                            if (!tieneAccesoModulo([p?.modulo?.var?.toLowerCase()], permisos)) return null;

                                            return (
                                                <Link
                                                    key={p.modulo.var}
                                                    to={UrlLocal + p.ruta}
                                                    onClick={async () => {
                                                        if (p.id != 8 && p.id != 3) await AddAccess('Consultar', 0, userLog, p.nombre);
                                                        else if (p.id == 3) await AddAccess('Modificar', 0, userLog, p.nombre);
                                                    }}
                                                    className="menu-item-single"
                                                >
                                                    <div className="menu-icon colorSecundario">
                                                        <i className={`bi ${m.icono} text-black`}></i>
                                                    </div>
                                                    <span className="menu-label">{m.menu}</span>
                                                </Link>
                                            )
                                        })
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="sidebar-footer">
                    <button onClick={() => setShowLogoutModal(true)} className="logout-button">
                        <i className="bi bi-box-arrow-left"></i>
                        <span>Salir</span>
                    </button>
                </div>
            </div >
        </>
    );
};

export default Sidebar;
