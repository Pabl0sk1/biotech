import { useState, useEffect } from 'react';
import { getShift, saveShift, updateShift, deleteShift } from '../services/turno.service.js';
import { getSchedule } from '../services/tipoturno.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from "../FiltroModal.jsx";
import { HourFormat } from '../utils/DateHourFormat.js';
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';

export const TurnoApp = ({ userLog, setUserLog }) => {

    const [turnos, setTurnos] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [turnoAGuardar, setTurnoAGuardar] = useState(null);
    const [turnoAEliminar, setTurnoAEliminar] = useState(null);
    const [turnoAVisualizar, setTurnoAVisualizar] = useState(null);
    const [detalleNoEliminar, setDetalleNoEliminar] = useState(false);
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
                if (detalleNoEliminar) {
                    setDetalleNoEliminar(false);
                } else {
                    setTurnoAEliminar(null);
                    setTurnoAVisualizar(null);
                    setTurnoAGuardar(null);
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [detalleNoEliminar]);

    const selected = {
        id: null,
        tipoturno: null,
        descripcion: "",
        horaent: "00:00",
        horasal: "00:00",
        horades: "00:00",
        thoras: 0,
        extporcen: 0
    };
    const fieldSettings = {
        id: { disabled: true, order: 0 },
        tipoturno: {
            type: "object",
            options: modalidades,
            searches: ['tipo'],
            label: "Modalidad",
            getLabel: (item) => item?.tipo || "",
            autofocus: true,
            module: ['rh02'],
            listPath: '/home/config/rrhh/schedules',
            popupTitle: 'Modalidades',
            notnull: true
        },
        descripcion: { label: "Descripción", notnull: true },
        horaent: { type: "time", label: "Horarío de entrada" },
        horasal: { type: "time", label: "Horarío de salida" },
        horades: { type: "time", label: "Tiempo de descanso" },
        thoras: { type: "number", label: "Total de horas semanales" },
        extporcen: { type: "number", label: "Porcentaje" },
        turnodia: { hidden: true }
    };

    const recuperarTurnos = () => {
        setQuery(q => ({ ...q }));
    }

    const recuperarModalidades = async () => {
        const response = await getSchedule();
        setModalidades(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:rh03`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getShift(query.page, query.size, query.order, filtrosFinal);
            setTurnos(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarModalidades();
    }, []);

    const eliminarTurnoFn = async (id) => {
        setLoading(true);
        await deleteShift(id);
        await AddAccess('Eliminar', id, userLog, "Turnos");
        recuperarTurnos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarTurnoFn(id);
        setTurnoAEliminar(null);
    }

    const handleEliminarTurno = async (turno) => {
        setTurnoAEliminar(turno);
    };

    const guardarFn = async (formData) => {
        setLoading(true);

        const turnoAGuardar = { ...formData };

        if (turnoAGuardar.id) {
            await updateShift(turnoAGuardar.id, turnoAGuardar);
            await AddAccess('Modificar', turnoAGuardar.id, userLog, "Turnos");
        } else {
            const nuevaTurno = await saveShift(turnoAGuardar);
            await AddAccess('Insertar', nuevaTurno.saved.id, userLog, "Turnos");
        }
        recuperarTurnos();
        setLoading(false);
        setTurnoAGuardar(null);
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

    const rows = [...turnos];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {turnoAEliminar && (
                <Delete setEliminar={setTurnoAEliminar} title={'turno'} gen={true} confirmar={confirmarEliminacion} id={turnoAEliminar.id} />
            )}

            {turnoAVisualizar && (
                <SmartModal
                    open={!!turnoAVisualizar}
                    onClose={() => setTurnoAVisualizar(null)}
                    title="Turno"
                    data={turnoAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {turnoAGuardar && (
                <SmartModal
                    open={!!turnoAGuardar}
                    onClose={() => setTurnoAGuardar(null)}
                    title="Turno"
                    data={turnoAGuardar}
                    onSave={handleSubmit}
                    mode={turnoAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'TURNOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Turnos
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
                                        <th onClick={() => toggleOrder("descripcion")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("descripcion")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["descripcion"] ?? {};
                                                    setFiltroActivo({
                                                        field: "descripcion",
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
                                        <th onClick={() => toggleOrder("tipoturno.tipo")} className="sortable-header">
                                            Modalidad
                                            <i className={`bi ${getSortIcon("tipoturno.tipo")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["tipoturno.tipo"] ?? {};
                                                    setFiltroActivo({
                                                        field: "tipoturno.tipo",
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
                                        <th>Horarío de Entrada</th>
                                        <th>Horarío de Salida</th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {turnos.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-3 text-muted fs-3 fw-bold">
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
                                                        if (puedeEditar) setTurnoAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.descripcion}</td>
                                                    <td className='text-start'>{v.tipoturno.tipo}</td>
                                                    <td>{HourFormat(v.horaent)}</td>
                                                    <td>{HourFormat(v.horasal)}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarTurno(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Turnos");
                                                                    setTurnoAVisualizar(v);
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
                            onAdd={() => setTurnoAGuardar(selected)}
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
}
