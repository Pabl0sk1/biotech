import { useState, useEffect } from 'react';
import { getAccess, deleteAccess } from '../services/auditoria.service.js';
import { getPermission } from '../services/permiso.service.js';
import { FiltroModal } from "../FiltroModal.jsx";
import { DateHourFormat } from '../utils/DateHourFormat.js';
import { ListControls } from '../ListControls.jsx';
import Header from '../Header';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';

export const AuditoriaApp = ({ userLog }) => {

    const [auditorias, setAuditorias] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [auditoriaAEliminar, setAuditoriaAEliminar] = useState(null);
    const [auditoriaAVisualizar, setAuditoriaAVisualizar] = useState(null);
    const [filtroActivo, setFiltroActivo] = useState({ visible: false });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState({
        page: 0,
        size: 10,
        order: "",
        filter: []
    });

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setAuditoriaAEliminar(null);
                setAuditoriaAVisualizar(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const fieldSettings = {
        id: { hidden: true },
        usuario: {
            type: "object",
            getLabel: (item) => item?.nombreusuario || "",
        },
        fecha: { hidden: true },
        fechahora: { type: "datetime-local", label: "Fecha y Hora" },
        codregistro: { type: "number", label: "Cód. Registro" },
        ip: { label: "IP" }
    };

    const recuperarAuditorias = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc01`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getAccess(query.page, query.size, query.order, filtrosFinal);
            setAuditorias(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarAuditoriaFn = async (id) => {
        setLoading(true);
        await deleteAccess(id);
        recuperarAuditorias();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarAuditoriaFn(id);
        setAuditoriaAEliminar(null);
    }

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

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    }

    const rows = [...auditorias];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {auditoriaAEliminar && (
                <Delete setEliminar={setAuditoriaAEliminar} title={'acceso'} gen={true} confirmar={confirmarEliminacion} id={auditoriaAEliminar.id} />
            )}

            {auditoriaAVisualizar && (
                <SmartModal
                    open={!!auditoriaAVisualizar}
                    onClose={() => setAuditoriaAVisualizar(null)}
                    title="Acceso"
                    data={auditoriaAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {auditoriaAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <label htmlFor="usuario" className="form-label m-0 mb-2">Usuario</label>
                                        <input
                                            type="text"
                                            id="usuario"
                                            name="usuario"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.usuario.nombreusuario || ''}
                                            readOnly
                                        />
                                        <label htmlFor="modulo" className="form-label m-0 mb-2">Módulo</label>
                                        <input
                                            type="text"
                                            id="modulo"
                                            name="modulo"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.programa || ''}
                                            readOnly
                                        />
                                        <label htmlFor="codregistro" className="form-label m-0 mb-2">Cód. Registro</label>
                                        <input
                                            type="number"
                                            id="codregistro"
                                            name="codregistro"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.codregistro || ''}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <label htmlFor="fechahora" className="form-label m-0 mb-2">Fecha y Hora</label>
                                        <input
                                            type="datetime-local"
                                            id="fechahora"
                                            name="fechahora"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.fechahora || ''}
                                            lang='es-ES'
                                            step={60}
                                            readOnly
                                        />
                                        <label htmlFor="operacion" className="form-label m-0 mb-2">Operación</label>
                                        <input
                                            type="text"
                                            id="operacion"
                                            name="operacion"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.operacion || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setAuditoriaAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'ACCESOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Accesos
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
                                        <th onClick={() => toggleOrder("usuario.nombreusuario")} className="sortable-header">
                                            Usuario
                                            <i className={`bi ${getSortIcon("usuario.nombreusuario")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["usuario.nombreusuario"] ?? {};
                                                    setFiltroActivo({
                                                        field: "usuario.nombreusuario",
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
                                        <th onClick={() => toggleOrder("fecha")} className="sortable-header">
                                            Fecha y Hora
                                            <i className={`bi ${getSortIcon("fecha")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["fecha"] ?? {};
                                                    setFiltroActivo({
                                                        field: "fecha",
                                                        type: "date",
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
                                        <th onClick={() => toggleOrder("programa")} className="sortable-header">
                                            Módulo
                                            <i className={`bi ${getSortIcon("programa")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["programa"] ?? {};
                                                    setFiltroActivo({
                                                        field: "programa",
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
                                        <th onClick={() => toggleOrder("operacion")} className="sortable-header">
                                            Operación
                                            <i className={`bi ${getSortIcon("operacion")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["operacion"] ?? {};
                                                    setFiltroActivo({
                                                        field: "operacion",
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
                                        <th onClick={() => toggleOrder("codregistro")} className="sortable-header">
                                            Cód. Registro
                                            <i className={`bi ${getSortIcon("codregistro")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["codregistro"] ?? {};
                                                    setFiltroActivo({
                                                        field: "codregistro",
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
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditorias.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-3 text-muted fs-3 fw-bold">
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.filter(v => v).map((v, index) => {
                                            const puedeEliminar = permiso?.puedeeliminar;
                                            const puedeVer = permiso?.puedever;
                                            return (
                                                <tr
                                                    className="text-center align-middle"
                                                    key={v ? v.id : `empty-${index}`}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.usuario.nombreusuario}</td>
                                                    <td>{DateHourFormat(v.fechahora, 1)}</td>
                                                    <td>{v.programa}</td>
                                                    <td>{v.operacion}</td>
                                                    <td>{v.codregistro}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) setAuditoriaAEliminar(v);
                                                            }}
                                                            className="btn border-0 me-2 p-0"
                                                            style={{ cursor: puedeEliminar ? 'pointer' : 'default' }}
                                                        >
                                                            <i className={`bi bi-trash-fill ${puedeEliminar ? 'text-danger' : 'text-danger-emphasis'}`}></i>
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (puedeVer) setAuditoriaAVisualizar(v);
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
                            onRefresh={refrescar}
                            canAdd={permiso?.puedeagregar}
                            canImport={permiso?.puedeimportar}
                            showErpButton={false}
                            showAddButton={false}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
