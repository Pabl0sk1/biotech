import { useState, useEffect } from 'react';
import { getUser, saveUser, updateUser, deleteUser } from '../services/usuario.service.js';
import { getBranch } from '../services/sucursal.service.js';
import { getRole } from '../services/tipousuario.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { ListControls } from '../ListControls.jsx';
import { obtenerClaseEstadoReg } from '../utils/StatusBadge.js';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import Duplicate from '../layouts/Duplicate.jsx';

export const UsuarioApp = ({ userLog }) => {

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
    const [usuarioDuplicado, setUsuarioDuplicado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filtroActivo, setFiltroActivo] = useState({ visible: false });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});
    const [query, setQuery] = useState({
        page: 0,
        size: 10,
        order: "",
        filter: []
    });

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setUsuarioAEliminar(null);
                setUsuarioNoEliminar(null);
                setUsuarioAVisualizar(null);
                if (usuarioDuplicado) {
                    setUsuarioDuplicado(null);
                    return;
                }
                setUsuarioAGuardar(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [usuarioDuplicado]);

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
        fechanacimiento: "",
        estado: "Activo",
        activo: true,
        online: false,
        vermapa: false,
        imagentipo: "",
        imagennombre: "",
        imagenurl: ""
    };
    const fieldSettings = {
        id: { hidden: true },
        tipousuario: {
            type: "object",
            options: roles,
            searches: ['tipousuario'],
            label: "Rol",
            getLabel: (item) => item?.tipousuario || "",
            module: ['sc03'],
            listPath: "/home/security/roles",
            popupTitle: "Roles",
            notnull: true,
            autofocus: true,
            order: 1
        },
        sucursal: {
            type: "object",
            options: sucursales,
            searches: ['sucursal'],
            label: "Sucursal",
            getLabel: (item) => item?.sucursal || "",
            module: ['gr03'],
            listPath: "/home/config/general/branchs",
            popupTitle: "Sucursales",
            notnull: true,
            order: 2
        },
        nombreusuario: { notnull: true, label: "Nombre de Usuario", order: 5 },
        contrasena: { type: "password", label: "Contraseña", notnull: true, order: 6 },
        nomape: { hidden: true },
        nombre: { notnull: true, order: 3 },
        apellido: { order: 4 },
        nrodoc: { label: "Nro. de documento", order: 7 },
        nrotelefono: { type: "tel", label: "Nro. de teléfono", order: 8 },
        correo: { type: "email", order: 9 },
        direccion: { type: "textarea", label: "Dirección", order: 13 },
        fechanacimiento: { type: "date", label: "Fecha de nacimiento", order: 10 },
        estado: { type: "select", options: ["Activo", "Inactivo"], notnull: true, order: 11 },
        vermapa: { type: "checkbox", label: "¿Puede ver informe Power-Bi?", order: 12 },
        activo: { hidden: true },
        online: { hidden: true },
        imagennombre: { hidden: true },
        imagentipo: { hidden: true },
        imagenurl: { hidden: true }
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
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc06`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getUser(query.page, query.size, query.order, filtrosFinal);
            setUsuarios(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarRoles();
        recuperarSucursales();
    }, []);

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

    const guardarFn = async (formData) => {
        setLoading(true);

        let activo = true;
        if (formData.estado == 'Inactivo') activo = false;

        let apellido = "";
        if (formData.apellido) apellido = ", " + formData.apellido;

        const usuarioAGuardar = {
            ...formData,
            nomape: formData.nombre + apellido,
            activo: activo
        };

        if (usuarioAGuardar.id) {
            await updateUser(usuarioAGuardar.id, usuarioAGuardar);
            await AddAccess('Modificar', usuarioAGuardar.id, userLog, "Usuarios");
        } else {
            const nuevoUsuario = await saveUser(usuarioAGuardar);
            await AddAccess('Insertar', nuevoUsuario.saved.id, userLog, "Usuarios");
        }
        recuperarUsuarios();
        setLoading(false);
        setUsuarioAGuardar(null);
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

    const verificarNombreUsuarioExistente = (nombreUsuario, id) => {
        return usuarios.some(u => u.nombreusuario.toLowerCase() === nombreUsuario.toLowerCase() && u.id !== id);
    };

    const handleSubmit = (formData) => {
        if (verificarNombreUsuarioExistente(formData.nombreusuario, formData.id)) {
            setUsuarioDuplicado(true);
            return;
        }
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const rows = [...usuarios];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {usuarioDuplicado && (
                <Duplicate setDuplicado={setUsuarioDuplicado} title={'nombre de usuario'} gen={true} />
            )}
            {usuarioAEliminar && (
                <Delete setEliminar={setUsuarioAEliminar} title={'usuario'} gen={true} confirmar={confirmarEliminacion} id={usuarioAEliminar.id} />
            )}
            {usuarioNoEliminar && (
                <NotDelete setNoEliminar={setUsuarioNoEliminar} title={'usuario'} gen={true} />
            )}

            {usuarioAVisualizar && (
                <SmartModal
                    open={!!usuarioAVisualizar}
                    onClose={() => setUsuarioAVisualizar(null)}
                    title="Usuario"
                    data={usuarioAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {usuarioAGuardar && (
                <SmartModal
                    open={!!usuarioAGuardar}
                    onClose={() => setUsuarioAGuardar(null)}
                    title="Usuario"
                    data={usuarioAGuardar}
                    onSave={handleSubmit}
                    mode={usuarioAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
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
                                        <th>ON</th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-3 text-muted fs-3 fw-bold">
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
                                                        const newV = { ...v, contrasena: "" };
                                                        if (puedeEditar) setUsuarioAGuardar(newV);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.nombreusuario}</td>
                                                    <td className='text-start'>{v.nomape}</td>
                                                    <td>{v.tipousuario.tipousuario}</td>
                                                    <td>{v.sucursal.sucursal}</td>
                                                    <td style={{ width: '140px' }}>
                                                        <p className={`text-center mx-auto w-75 ${obtenerClaseEstadoReg(v.activo)} m-0 rounded-2 border border-black`}>
                                                            {v.estado}
                                                        </p>
                                                    </td>
                                                    <td className='p-0'>
                                                        <span className={`bi bi-circle-fill ${v.online ? 'text-success' : 'text-danger'}`}></span>
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
                        <ListControls
                            query={query}
                            setQuery={setQuery}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            onAdd={() => setUsuarioAGuardar(selected)}
                            onRefresh={refrescar}
                            canAdd={permiso?.puedeagregar}
                            canImport={permiso?.puedeimportar}
                            showErpButton={false}
                            showAddButton={true}
                            addData={selected}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
