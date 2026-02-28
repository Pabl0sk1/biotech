import { useState, useEffect } from 'react';
import { getReportType, saveReportType, updateReportType, deleteReportType } from '../services/tipoinforme.service.js';
import { getReport } from '../services/informe.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from "../FiltroModal.jsx";
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';

export const EscenarioApp = ({ userLog }) => {

    const [escenarios, setEscenarios] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [escenarioAGuardar, setEscenarioAGuardar] = useState(null);
    const [escenarioAEliminar, setEscenarioAEliminar] = useState(null);
    const [escenarioNoEliminar, setEscenarioNoEliminar] = useState(null);
    const [escenarioAVisualizar, setEscenarioAVisualizar] = useState(null);
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
                setEscenarioAEliminar(null);
                setEscenarioNoEliminar(null);
                setEscenarioAVisualizar(null);
                setEscenarioAGuardar(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selected = {
        id: null,
        tipoinforme: ""
    };
    const fieldSettings = {
        id: { hidden: true },
        tipoinforme: { notnull: true, label: "Descripción", autofocus: true },
    };

    const recuperarEscenarios = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:gr07`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getReportType(query.page, query.size, query.order, filtrosFinal);
            setEscenarios(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarEscenarioFn = async (id) => {
        setLoading(true);
        await deleteReportType(id);
        await AddAccess('Eliminar', id, userLog, "Escenarios");
        recuperarEscenarios();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarEscenarioFn(id);
        setEscenarioAEliminar(null);
    }

    const handleEliminarEscenario = async (escenario) => {
        const rel = await getReport('', '', '', `tipoinforme.id:eq:${escenario?.id}`);
        if (rel.items.length > 0) setEscenarioNoEliminar(escenario);
        else setEscenarioAEliminar(escenario);
    };

    const guardarFn = async (formData) => {
        setLoading(true);

        const escenarioAGuardar = { ...formData };

        if (escenarioAGuardar.id) {
            await updateReportType(escenarioAGuardar.id, escenarioAGuardar);
            await AddAccess('Modificar', escenarioAGuardar.id, userLog, "Escenarios");
        } else {
            const nuevoEscenario = await saveReportType(escenarioAGuardar);
            await AddAccess('Insertar', nuevoEscenario.saved.id, userLog, "Escenarios");
        }
        recuperarEscenarios();
        setLoading(false);
        setEscenarioAGuardar(null);
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

    const handleSubmit = (formData) => {
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    }

    const rows = [...escenarios];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {escenarioAEliminar && (
                <Delete setEliminar={setEscenarioAEliminar} title={'escenario'} gen={true} confirmar={confirmarEliminacion} id={escenarioAEliminar.id} />
            )}
            {escenarioNoEliminar && (
                <NotDelete setNoEliminar={setEscenarioNoEliminar} title={'escenario'} gen={true} />
            )}

            {escenarioAVisualizar && (
                <SmartModal
                    open={!!escenarioAVisualizar}
                    onClose={() => setEscenarioAVisualizar(null)}
                    title="Escenario"
                    data={escenarioAVisualizar}
                    fieldSettings={fieldSettings}
                    columns={1}
                    userLog={userLog}
                />
            )}

            {escenarioAGuardar && (
                <SmartModal
                    open={!!escenarioAGuardar}
                    onClose={() => setEscenarioAGuardar(null)}
                    title="Escenario"
                    data={escenarioAGuardar}
                    onSave={handleSubmit}
                    mode={escenarioAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    columns={1}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'ESCENARIOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Escenarios
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
                                        <th onClick={() => toggleOrder("tipoinforme")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("tipoinforme")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["tipoinforme"] ?? {};
                                                    setFiltroActivo({
                                                        field: "tipoinforme",
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
                                    {escenarios.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-3 text-muted fs-3 fw-bold">
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
                                                        if (puedeEditar) setEscenarioAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.tipoinforme}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarEscenario(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Escenarios");
                                                                    setEscenarioAVisualizar(v);
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
                            onAdd={() => setEscenarioAGuardar(selected)}
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
