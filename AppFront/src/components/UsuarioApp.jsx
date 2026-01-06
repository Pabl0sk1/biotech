import { useState, useEffect } from 'react';
import { getUser, saveUser, updateUser, deleteUser } from '../services/usuario.service.js';
import { getBranch } from '../services/sucursal.service.js';
import { getRole } from '../services/tipousuario.service.js';
import { getPermission } from '../services/permiso.service.js';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { tienePermisoRuta } from '../utils/RouteAccess.js';
import { useNavigate } from 'react-router-dom';
import AutocompleteSelect from '../AutocompleteSelect.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';

export const UsuarioApp = ({ userLog }) => {

    const navigate = useNavigate();
    const [nombreUsuarioMsj, setNombreUsuarioMsj] = useState('');
    const [nombreUsuarioError, setNombreUsuarioError] = useState(false);
    const [newPassMsj, setNewPassMsj] = useState('');
    const [newPassError, setNewPassError] = useState(false);
    const [repeatPassMsj, setRepeatPassMsj] = useState('');
    const [repeatPassError, setRepeatPassError] = useState(false);
    const [repeatPassword, setRepeatPassword] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [usuarioAGuardar, setUsuarioAGuardar] = useState(null);
    const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
    const [usuarioNoEliminar, setUsuarioNoEliminar] = useState(null);
    const [usuarioAVisualizar, setUsuarioAVisualizar] = useState(null);
    const [showPasswordNueva, setShowPasswordNueva] = useState(false);
    const [showPasswordRepetir, setShowPasswordRepetir] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filtroActivo, setFiltroActivo] = useState({ visible: false });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});
    const [query, setQuery] = useState({
        page: 0,
        size: 10,
        order: "",
        filter: []
    });

    const [puedeCrearRol, setPuedeCrearRol] = useState(false);
    const [puedeCrearSucursal, setPuedeCrearSucursal] = useState(false);

    useEffect(() => {
        const loadPermiso = async () => {
            const ok1 = await tienePermisoRuta(['sc03'], userLog?.tipousuario?.id);
            setPuedeCrearRol(ok1);
            const ok2 = await tienePermisoRuta(['gr03'], userLog?.tipousuario?.id);
            setPuedeCrearSucursal(ok2);
        };

        if (userLog?.tipousuario?.id) {
            loadPermiso();
        }
    }, [userLog]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setUsuarioAEliminar(null);
                setUsuarioNoEliminar(null);
                setUsuarioAVisualizar(null);
                setUsuarioAGuardar(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    useEffect(() => {
        const forms = document.querySelectorAll('.needs-validation');
        Array.from(forms).forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, []);

    const selected = {
        id: null,
        tipousuario: null,
        sucursal: null,
        nombreusuario: "",
        contrasena: "",
        nomape: "",
        nombre: "",
        apellido: "",
        nrodoc: "",
        nrotelefono: "",
        correo: "",
        direccion: "",
        estado: "Activo",
        activo: true,
        vermapa: false,
        fechanacimiento: "",
        imagentipo: "",
        imagennombre: "",
        imagenurl: ""
    };

    const recuperarUsuarios = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarRoles = async () => {
        const response = await getRole();
        setRoles(response.items);
    }

    const recuperarSucursales = async () => {
        const response = await getBranch();
        setSucursales(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc02`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getUser(query.page, query.size, query.order, filtrosFinal);
            setUsuarios(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            recuperarRoles();
            recuperarSucursales();
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarUsuarioFn = async (id) => {
        setLoading(true);
        await deleteUser(id);
        await AddAccess('Eliminar', id, userLog, "Usuarios");
        recuperarUsuarios();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarUsuarioFn(id);
        setUsuarioAEliminar(null);
    }

    const handleEliminarUsuario = async (usuario) => {
        setUsuarioAEliminar(usuario);
    };

    const guardarFn = async (usuarioAGuardar) => {
        setUsuarioAGuardar(null);
        setLoading(true);

        let activo = true;
        if (usuarioAGuardar.estado == 'Inactivo') activo = false;

        let apellido = "";
        if (usuarioAGuardar.apellido) apellido = ", " + usuarioAGuardar.apellido;

        const usuarioActualizado = {
            ...usuarioAGuardar,
            nomape: usuarioAGuardar.nombre + apellido,
            activo: activo
        };

        if (usuarioActualizado.id) {
            await updateUser(usuarioActualizado.id, usuarioActualizado);
            await AddAccess('Modificar', usuarioActualizado.id, userLog, "Usuarios");
        } else {
            const nuevoUsuario = await saveUser(usuarioActualizado);
            await AddAccess('Insertar', nuevoUsuario.saved.id, userLog, "Usuarios");
        }
        recuperarUsuarios();
        setLoading(false);
    };

    const nextPage = () => {
        if (query.page + 1 < totalPages) setQuery(q => ({ ...q, page: q.page + 1 }));
    };

    const prevPage = () => {
        if (query.page > 0) setQuery(q => ({ ...q, page: q.page - 1 }));
    };

    const toggleOrder = (field) => {
        const [currentField, dir] = query.order.split(",");
        const newDir = (currentField === field && dir === "asc") ? "desc" : "asc";

        setQuery(q => ({ ...q, order: `${field},${newDir}` }));
    };

    const getSortIcon = (field) => {
        const [currentField, direction] = query.order.split(",");

        if (currentField !== field) return "bi-chevron-expand";

        return direction === "asc"
            ? "bi-chevron-up"
            : "bi-chevron-down";
    };

    const generarFiltro = (f) => {
        if (!f.op) {
            setFiltroActivo({ ...filtroActivo, op: "eq" })
            f = ({ ...f, op: "eq" })
        }

        const field = f.field.trim();
        const op = f.op.trim();
        let filtro = "";

        if (op === "between") {
            if (!f.value1 || !f.value2) return null;
            filtro = `${field}:between:${f.value1}..${f.value2}`;
        } else {
            if (!f.value) return null;
            filtro = `${field}:${op}:${f.value}`;
        }

        return filtro;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        let sw = 0;
        if (!usuarioAGuardar.tipousuario || !usuarioAGuardar.nombre) sw = 1;
        if (!usuarioAGuardar.nombreusuario) {
            setNombreUsuarioMsj('El nombre de usuario es obligatorio y no debe sobrepasar los 50 caracteres.');
            setNombreUsuarioError(true);
            sw = 1;
        } else {
            const existe = verificarNombreUsuarioExistente(usuarioAGuardar.nombreusuario, usuarioAGuardar.id);
            if (existe) {
                setNombreUsuarioMsj('El nombre de usuario ya existe.');
                setNombreUsuarioError(true);
                sw = 1;
            } else {
                setNombreUsuarioMsj('');
                setNombreUsuarioError(false);
            }
        }
        if (!usuarioAGuardar.id) {
            if (!usuarioAGuardar.contrasena) {
                setNewPassMsj("La contraseña es obligatoria y no debe sobrepasar los 30 caracteres.");
                setNewPassError(true);
                sw = 1;
            } else if (usuarioAGuardar.contrasena.length < 8) {
                setNewPassMsj("La contraseña debe contener al menos 8 caracteres.");
                setNewPassError(true);
                sw = 1;
            } else {
                setNewPassMsj('');
                setNewPassError(false);
            }
            if (!repeatPassword) {
                setRepeatPassMsj("Debe volver a introducir la contraseña.");
                setRepeatPassError(true);
                sw = 1;
            } else if (usuarioAGuardar.contrasena !== repeatPassword) {
                setRepeatPassMsj("Las contraseñas no coinciden.");
                setRepeatPassError(true);
                sw = 1;
            } else {
                setRepeatPassMsj('');
                setRepeatPassError(false);
            }
        }

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...usuarioAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const obtenerClaseEstado = (activo) => {
        return activo ? 'text-bg-success' : 'text-bg-danger';
    };

    const verificarNombreUsuarioExistente = (nombreUsuario, id) => {
        return usuarios.some(u => u.nombreusuario.toLowerCase() === nombreUsuario.toLowerCase() && u.id !== id);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const handleOpenForm = (usuario) => {
        setShowPasswordNueva(false);
        setShowPasswordRepetir(false);
        setRepeatPassword('');
        setNewPassMsj('');
        setRepeatPassMsj('');
        setNewPassError(false);
        setRepeatPassError(false);
        setNombreUsuarioMsj('');
        setNombreUsuarioError(false);
        setUsuarioAGuardar(usuario);
    };

    const rows = [...usuarios];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {usuarioAEliminar && (
                <Delete setEliminar={setUsuarioAEliminar} title={'usuario'} gen={true} confirmar={confirmarEliminacion} id={usuarioAEliminar.id} />
            )}
            {usuarioNoEliminar && (
                <NotDelete setNoEliminar={setUsuarioNoEliminar} title={'usuario'} gen={true} />
            )}

            {usuarioAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg" style={{ width: '800px' }}>
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col pe-0'>
                                        <label htmlFor="nombreusuario" className="form-label m-0 mb-2">Nombre de Usuario</label>
                                        <input
                                            type="text"
                                            id="nombreusuario"
                                            name="nombreusuario"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.nombreusuario || ''}
                                            readOnly
                                        />
                                        <label htmlFor="nombre" className="form-label m-0 mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.nombre || ''}
                                            readOnly
                                        />
                                        <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                        <input
                                            type="text"
                                            id="nrodoc"
                                            name="nrodoc"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.nrodoc || ''}
                                            readOnly
                                        />
                                        <label htmlFor="correo" className="form-label m-0 mb-2">Correo</label>
                                        <input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.correo || ''}
                                            readOnly
                                        />
                                        <label htmlFor="sucursal" className="form-label m-0 mb-2">Sucursal</label>
                                        <input
                                            type="text"
                                            id="sucursal"
                                            name="sucursal"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.sucursal.sucursal || ''}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 me-5 p-0'>
                                        <label htmlFor="tipousuario" className="form-label m-0 mb-2">Rol</label>
                                        <input
                                            type="text"
                                            id="tipousuario"
                                            name="tipousuario"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.tipousuario.tipousuario || ''}
                                            readOnly
                                        />
                                        <label htmlFor="apellido" className="form-label m-0 mb-2">Apellido</label>
                                        <input
                                            type="text"
                                            id="apellido"
                                            name="apellido"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.apellido || ''}
                                            readOnly
                                        />
                                        <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                        <input
                                            type="text"
                                            id="nrotelefono"
                                            name="nrotelefono"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.nrotelefono || ''}
                                            readOnly
                                        />
                                        <label htmlFor="fechanacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            id="fechanacimiento"
                                            name="fechanacimiento"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.fechanacimiento || ''}
                                            readOnly
                                        />
                                        <label htmlFor="estado" className="form-label m-0 mb-2">Estado</label>
                                        <input
                                            type="text"
                                            id="estado"
                                            name="estado"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.estado || ''}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 3 de visualizar*/}
                                    <div className='col ps-0'>
                                        <label htmlFor="direccion" className="form-label m-0 mb-2">Dirección</label>
                                        <textarea
                                            type="text"
                                            id="direccion"
                                            name="direccion"
                                            className="form-control border-input w-100 border-black mb-3"
                                            style={{ resize: 'none', height: '295px' }}
                                            value={usuarioAVisualizar.direccion || ''}
                                            readOnly>
                                        </textarea>
                                        <label htmlFor="vermapa" className="form-label m-0 mb-2 me-2 d-flex">Ver Mapa</label>
                                        <input
                                            type="checkbox"
                                            id="vermapa"
                                            name="vermapa"
                                            className="form-check-input"
                                            style={{ width: '60px', height: '30px' }}
                                            checked={usuarioAVisualizar.vermapa || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setUsuarioAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {usuarioAGuardar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg" style={{ width: '800px' }}>
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <form
                                    action="url.ph"
                                    onSubmit={handleSubmit}
                                    className="needs-validation"
                                    noValidate
                                >
                                    <div className="row mb-3 fw-semibold text-start">
                                        {/*Columna 1 de guardar*/}
                                        <div className='col pe-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nombreusuario" className="form-label m-0 mb-2">Nombre de Usuario</label>
                                                <input
                                                    type="text"
                                                    id="nombreusuario"
                                                    name="nombreusuario"
                                                    className={`form-control border-input w-100 ${nombreUsuarioError ? 'is-invalid' : ''}`}
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.nombreusuario || ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value.toUpperCase() })}
                                                    required
                                                    autoFocus
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>{nombreUsuarioMsj}
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nombre" className="form-label m-0 mb-2">Nombre</label>
                                                <input
                                                    type="text"
                                                    id="nombre"
                                                    name="nombre"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.nombre || ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    maxLength={150}
                                                />
                                                <div className="invalid-feedback text-dangertext-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El nombre es obligatorio y no debe sobrepasar los 150 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                                <input
                                                    type="text"
                                                    id="nrodoc"
                                                    name="nrodoc"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.nrodoc || ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="correo" className="form-label m-0 mb-2">Correo</label>
                                                <input
                                                    type="email"
                                                    id="correo"
                                                    name="correo"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.correo || ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="sucursal" className="form-label m-0 mb-2">Sucursal</label>
                                                <i style={{ cursor: puedeCrearSucursal ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearSucursal ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearSucursal) {
                                                            await AddAccess('Consultar', 0, userLog, 'Sucursales')
                                                            navigate('/home/config/general/branchs')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={sucursales}
                                                    value={usuarioAGuardar.sucursal}
                                                    getLabel={(v) => v.sucursal}
                                                    searchFields={[
                                                        v => v.sucursal
                                                    ]}
                                                    onChange={(v) =>
                                                        setUsuarioAGuardar({
                                                            ...usuarioAGuardar,
                                                            sucursal: v
                                                        })
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                            {usuarioAGuardar.id === null && (
                                                <div className='form-group mb-1'>
                                                    <label htmlFor="contrasena" className="form-label m-0 mb-2">Contraseña</label>
                                                    <div className="d-flex align-items-center position-relative">
                                                        <input
                                                            type={showPasswordNueva ? "text" : "password"}
                                                            id="contrasena"
                                                            name="contrasena"
                                                            className="form-control border-input w-100 pe-5"
                                                            placeholder="Escribe..."
                                                            value={usuarioAGuardar.contrasena || ''}
                                                            onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                            required
                                                            autoComplete='off'
                                                            maxLength={30}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-light btn-eye"
                                                            style={{ marginTop: '7px' }}
                                                            onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                                                        >
                                                            {showPasswordNueva ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                                        </button>
                                                    </div>
                                                    {newPassError && (
                                                        <div className="text-danger text-start mt-1" style={{ fontSize: '14px' }}>
                                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>{newPassMsj}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {/*Columna 2 de guardar*/}
                                        <div className='col ms-5 me-5 p-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="tipousuario" className="form-label m-0 mb-2">Rol</label>
                                                <i style={{ cursor: puedeCrearRol ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearRol ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearRol) {
                                                            await AddAccess('Consultar', 0, userLog, 'Roles')
                                                            navigate('/home/security/roles')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={roles}
                                                    value={usuarioAGuardar.tipousuario}
                                                    getLabel={(v) => v.tipousuario}
                                                    searchFields={[
                                                        v => v.tipousuario
                                                    ]}
                                                    onChange={(v) =>
                                                        setUsuarioAGuardar({
                                                            ...usuarioAGuardar,
                                                            tipousuario: v
                                                        })
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="apellido" className="form-label m-0 mb-2">Apellido</label>
                                                <input
                                                    type="text"
                                                    id="apellido"
                                                    name="apellido"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.apellido || ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={150}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                                <input
                                                    type="text"
                                                    id="nrotelefono"
                                                    name="nrotelefono"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.nrotelefono || ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="fechanacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                                <input
                                                    type="date"
                                                    id="fechanacimiento"
                                                    name="fechanacimiento"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.fechanacimiento || ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="estado" className="form-label m-0 mb-2">Estado</label>
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="estado"
                                                    id='estado'
                                                    value={usuarioAGuardar.estado ? usuarioAGuardar.estado : ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    disabled={!usuarioAGuardar.id}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione un estado...</option>
                                                    <option key={1} value={'Activo'}>Activo</option>
                                                    <option key={2} value={'Inactivo'}>Inactivo</option>
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El estado es obligatorio.
                                                </div>
                                            </div>
                                            {usuarioAGuardar.id === null && (
                                                <div className='form-group mb-1'>
                                                    <label htmlFor="repetircontrasena" className="form-label m-0 mb-2">Repetir Contraseña</label>
                                                    <div className="d-flex align-items-center position-relative">
                                                        <input
                                                            type={showPasswordRepetir ? "text" : "password"}
                                                            id="repetircontrasena"
                                                            name="repetircontrasena"
                                                            className="form-control border-input w-100 pe-5"
                                                            placeholder="Escribe..."
                                                            value={repeatPassword || ''}
                                                            onChange={(event) => setRepeatPassword(event.target.value)}
                                                            autoComplete='new-password'
                                                            maxLength={30}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-light btn-eye"
                                                            style={{ marginTop: '7px' }}
                                                            onClick={() => setShowPasswordRepetir(!showPasswordRepetir)}
                                                        >
                                                            {showPasswordRepetir ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                                        </button>
                                                    </div>
                                                    {repeatPassError && (
                                                        <div className="text-danger text-start mt-1" style={{ fontSize: '14px' }}>
                                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>{repeatPassMsj}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {/*Columna 3 de visualizar*/}
                                        <div className='col ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="direccion" className="form-label m-0 mb-2">Dirección</label>
                                                <textarea
                                                    id="direccion"
                                                    name="direccion"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    style={{ resize: 'none', height: '260px' }}
                                                    value={usuarioAGuardar.direccion || ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={150}>
                                                </textarea>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="vermapa" className="form-label m-0 mb-2 me-2 d-flex">Ver Mapa</label>
                                                <input
                                                    type="checkbox"
                                                    id="vermapa"
                                                    name="vermapa"
                                                    className="form-check-input"
                                                    style={{ width: '60px', height: '30px' }}
                                                    checked={usuarioAGuardar.vermapa || ''}
                                                    onChange={(e) => {
                                                        const check = e.target.checked;
                                                        setUsuarioAGuardar({ ...usuarioAGuardar, [e.target.name]: check });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setUsuarioAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
                                            <i className="bi bi-x-lg me-2"></i>Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div >
                </>
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'USUARIOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Usuarios
                        </p>
                        <div className="p-3">
                            <FiltroModal
                                filtroActivo={filtroActivo}
                                setFiltroActivo={setFiltroActivo}
                                setQuery={setQuery}
                                setFiltrosAplicados={setFiltrosAplicados}
                                generarFiltro={generarFiltro}
                            />
                            <table className='table table-bordered table-sm table-hover m-0 border-secondary-subtle'>
                                <thead className='table-success'>
                                    <tr>
                                        <th onClick={() => toggleOrder("id")} className="sortable-header">
                                            #
                                            <i className={`bi ${getSortIcon("id")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["id"] ?? {};
                                                    setFiltroActivo({
                                                        field: "id",
                                                        type: "number",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("nombreusuario")} className="sortable-header">
                                            Usuario
                                            <i className={`bi ${getSortIcon("nombreusuario")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombreusuario"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombreusuario",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("nomape")} className="sortable-header">
                                            Nombre/Apellido
                                            <i className={`bi ${getSortIcon("nomape")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nomape"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nomape",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("tipousuario.tipousuario")} className="sortable-header">
                                            Rol
                                            <i className={`bi ${getSortIcon("tipousuario.tipousuario")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["tipousuario.tipousuario"] ?? {};
                                                    setFiltroActivo({
                                                        field: "tipousuario.tipousuario",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("sucursal.sucursal")} className="sortable-header">
                                            Sucursal
                                            <i className={`bi ${getSortIcon("sucursal.sucursal")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["sucursal.sucursal"] ?? {};
                                                    setFiltroActivo({
                                                        field: "sucursal.sucursal",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("estado")} className="sortable-header">
                                            Estado
                                            <i className={`bi ${getSortIcon("estado")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["estado"] ?? {};
                                                    setFiltroActivo({
                                                        field: "estado",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-3 text-muted fs-3 fw-bold">
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.filter(v => v).map((v, index) => {
                                            const puedeEditar = permiso?.puedeeditar && v.id != userLog?.id && v.id != 1;
                                            const puedeEliminar = permiso?.puedeeliminar && v.id != userLog?.id && v.id != 1;
                                            const puedeVer = permiso?.puedever;
                                            return (
                                                <tr
                                                    className="text-center align-middle"
                                                    key={v ? v.id : `empty-${index}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (puedeEditar) handleOpenForm(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.nombreusuario}</td>
                                                    <td className='text-start'>{v.nomape}</td>
                                                    <td>{v.tipousuario.tipousuario}</td>
                                                    <td>{v.sucursal.sucursal}</td>
                                                    <td style={{ width: '140px' }}>
                                                        <p className={`text-center mx-auto w-75 ${obtenerClaseEstado(v.activo)} m-0 rounded-2 border border-black`}>
                                                            {v.estado}
                                                        </p>
                                                    </td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarUsuario(v);
                                                            }}
                                                            className="btn border-0 me-2 p-0"
                                                            style={{ cursor: puedeEliminar ? 'pointer' : 'default' }}
                                                        >
                                                            <i className={`bi bi-trash-fill ${puedeEliminar ? 'text-danger' : 'text-danger-emphasis'}`}></i>
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (puedeVer) {
                                                                    await AddAccess('Visualizar', v.id, userLog, "Usuarios");
                                                                    setUsuarioAVisualizar(v);
                                                                }
                                                            }}
                                                            className="btn border-0 ms-2 p-0"
                                                            style={{ cursor: puedeVer ? 'pointer' : 'default' }}
                                                        >
                                                            <i className={`bi bi-eye-fill ${puedeVer ? 'text-primary' : 'text-primary-emphasis'}`}></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => handleOpenForm(selected)} className="btn btn-secondary fw-bold me-2" disabled={!permiso?.puedeagregar}>
                                <i className="bi bi-plus-circle"></i>
                            </button>
                            <button onClick={() => refrescar()} className="btn btn-secondary fw-bold ms-2 me-2">
                                <i className="bi bi-arrow-repeat"></i>
                            </button>
                            <div className="d-flex align-items-center ms-5">
                                <label className="me-2 fw-semibold">Tamaño</label>
                                <select
                                    className="form-select form-select-sm border-black"
                                    value={query.size}
                                    onChange={(e) => {
                                        const newSize = Number(e.target.value);
                                        setQuery(q => ({
                                            ...q,
                                            page: 0,
                                            size: newSize
                                        }));
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={30}>30</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="d-flex align-items-center ms-5">
                                <label className="me-2 fw-semibold">Total</label>{totalItems}
                            </div>
                            <nav aria-label="page navigation" className='user-select-none ms-auto'>
                                <ul className="pagination m-0">
                                    <li className={`page-item ${query.page == 0 ? 'disabled' : ''}`}>
                                        <button className={`page-link ${query.page == 0 ? 'rounded-end-0 border-black' : 'text-bg-light rounded-end-0 border-black'}`} onClick={() => prevPage()}>
                                            <i className="bi bi-arrow-left"></i>
                                        </button>
                                    </li>
                                    <li className="page-item disabled">
                                        <button className="page-link text-bg-secondary rounded-0 fw-bold border-black">{query.page + 1} de {totalPages ? totalPages : 1}</button>
                                    </li>
                                    <li className={`page-item ${query.page + 1 >= totalPages ? 'disabled' : ''}`}>
                                        <button className={`page-link ${query.page + 1 >= totalPages ? 'rounded-start-0 border-black' : 'text-bg-light rounded-start-0 border-black'}`} onClick={() => nextPage()}>
                                            <i className="bi bi-arrow-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
