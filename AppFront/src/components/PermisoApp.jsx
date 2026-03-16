import { useState, useEffect } from 'react';
import { getPermission, savePermission, updatePermission, deletePermission } from '../services/permiso.service.js';
import { getRole } from '../services/tipousuario.service.js';
import { getModule } from '../services/modulo.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import Duplicate from '../layouts/Duplicate.jsx';

export const PermisoApp = ({ userLog, setUserLog }) => {

    const [permisos, setPermisos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [permisoAGuardar, setPermisoAGuardar] = useState(null);
    const [permisoAEliminar, setPermisoAEliminar] = useState(null);
    const [permisoNoEliminar, setPermisoNoEliminar] = useState(null);
    const [permisoAVisualizar, setPermisoAVisualizar] = useState(null);
    const [permisoDuplicado, setPermisoDuplicado] = useState(null);
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
                setPermisoAEliminar(null);
                setPermisoNoEliminar(null);
                setPermisoAVisualizar(null);
                if (permisoDuplicado) {
                    setPermisoDuplicado(null);
                    return;
                }
                setPermisoAGuardar(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [permisoDuplicado]);

    const selected = {
        id: null,
        tipousuario: null,
        modulo: null,
        puedeconsultar: false,
        puedever: false,
        puedeagregar: false,
        puedeeliminar: false,
        puedeeditar: false,
        puedeimportar: false
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        tipousuario: {
            type: "object",
            options: roles,
            searches: ['tipousuario'],
            label: "Rol",
            getLabel: (item) => item?.tipousuario || "",
            autofocus: true,
            module: ['sc03'],
            listPath: "/home/security/roles",
            popupTitle: "Roles",
            notnull: true
        },
        modulo: {
            type: "object",
            options: modulos,
            searches: ['moduloes', 'var'],
            label: "Módulo",
            getLabel: (item) => item?.moduloes || "",
            module: ['sc02'],
            listPath: "/home/security/modules",
            popupTitle: "Módulos",
            notnull: true
        },
        puedeconsultar: { type: "checkbox", label: "¿Puede consultar?" },
        puedever: { type: "checkbox", label: "¿Puede ver?" },
        puedeagregar: { type: "checkbox", label: "¿Puede agregar?" },
        puedeeliminar: { type: "checkbox", label: "¿Puede eliminar?" },
        puedeeditar: { type: "checkbox", label: "¿Puede editar?" },
        puedeimportar: { type: "checkbox", label: "¿Puede importar?" },
    };

    const recuperarPermisos = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarRoles = async () => {
        const response = await getRole();
        setRoles(response.items);
    }

    const recuperarModulos = async () => {
        const response = await getModule();
        setModulos(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc05`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getPermission(query.page, query.size, query.order, filtrosFinal);
            setPermisos(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarModulos();
        recuperarRoles();
    }, []);

    const eliminarPermisoFn = async (id) => {
        setLoading(true);
        await deletePermission(id);
        await AddAccess('Eliminar', id, userLog, "Permisos");
        recuperarPermisos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarPermisoFn(id);
        setPermisoAEliminar(null);
    }

    const handleEliminarPermiso = async (permiso) => {
        setPermisoAEliminar(permiso);
    };

    const guardarFn = async (formData) => {
        setLoading(true);

        const permisoAGuardar = { ...formData };

        if (permisoAGuardar.id) {
            await updatePermission(permisoAGuardar.id, permisoAGuardar);
            await AddAccess('Modificar', permisoAGuardar.id, userLog, "Permisos");
        } else {
            const nuevoPermiso = await savePermission(permisoAGuardar);
            await AddAccess('Insertar', nuevoPermiso.saved.id, userLog, "Permisos");
        }
        recuperarPermisos();
        setLoading(false);
        setPermisoAGuardar(null);
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

    const verificarPermisoDuplicado = (dato) => {
        return permisos.some(p => p.tipousuario.id == dato.tipousuario.id && p.modulo.id == dato.modulo.id && p.id !== dato.id);
    };

    const handleSubmit = (formData) => {
        if (verificarPermisoDuplicado(formData)) {
            setPermisoDuplicado(true);
            return;
        }
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const rows = [...permisos];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {permisoDuplicado && (
                <Duplicate setDuplicado={setPermisoDuplicado} title={'permiso'} gen={true} />
            )}
            {permisoAEliminar && (
                <Delete setEliminar={setPermisoAEliminar} title={'permiso'} gen={true} confirmar={confirmarEliminacion} id={permisoAEliminar.id} />
            )}
            {permisoNoEliminar && (
                <NotDelete setNoEliminar={setPermisoNoEliminar} title={'permiso'} gen={true} />
            )}

            {permisoAVisualizar && (
                <SmartModal
                    open={!!permisoAVisualizar}
                    onClose={() => setPermisoAVisualizar(null)}
                    title="Permiso"
                    data={permisoAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {permisoAGuardar && (
                <SmartModal
                    open={!!permisoAGuardar}
                    onClose={() => setPermisoAGuardar(null)}
                    title="Permiso"
                    data={permisoAGuardar}
                    onSave={handleSubmit}
                    mode={permisoAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'PERMISOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Permisos
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
                                        <th onClick={() => toggleOrder("modulo.var")} className="sortable-header">
                                            Variable
                                            <i className={`bi ${getSortIcon("modulo.var")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["modulo.var"] ?? {};
                                                    setFiltroActivo({
                                                        field: "modulo.var",
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
                                        <th onClick={() => toggleOrder("modulo.moduloes")} className="sortable-header">
                                            Módulo
                                            <i className={`bi ${getSortIcon("modulo.moduloes")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["modulo.moduloes"] ?? {};
                                                    setFiltroActivo({
                                                        field: "modulo.moduloes",
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
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permisos.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-3 text-muted fs-3 fw-bold">
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.filter(v => v).map((v, index) => {
                                            const puedeEditar = permiso?.puedeeditar;
                                            const puedeEliminar = permiso?.puedeeliminar;
                                            const puedeVer = permiso?.puedever;
                                            return (
                                                <tr
                                                    className="text-center align-middle"
                                                    key={v ? v.id : `empty-${index}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (puedeEditar) setPermisoAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td>{v.modulo.var}</td>
                                                    <td>{v.modulo.moduloes}</td>
                                                    <td>{v.tipousuario.tipousuario}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarPermiso(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Permisos");
                                                                    setPermisoAVisualizar(v);
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
                            onAdd={() => setPermisoAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setPermisoAGuardar(true)}
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
