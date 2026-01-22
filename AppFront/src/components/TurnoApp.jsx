import { useState, useEffect } from 'react';
import { getShift, saveShift, updateShift, deleteShift } from '../services/turno.service.js';
import { getSchedule } from '../services/tipoturno.service.js';
import { getPermission } from '../services/permiso.service.js';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from "../FiltroModal.jsx";
import { HourFormat } from '../utils/DateHourFormat.js';
import { tienePermisoRuta } from '../utils/RouteAccess.js';
import { useNavigate } from 'react-router-dom';
import { ListControls } from '../ListControls.jsx';
import AutocompleteSelect from '../AutocompleteSelect.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';

export const TurnoApp = ({ userLog }) => {

    const navigate = useNavigate();
    const [turnos, setTurnos] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [detallesAEliminar, setDetallesAEliminar] = useState([]);
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

    const [puedeCrearModalidad, setPuedeCrearModalidad] = useState(false);

    useEffect(() => {
        const loadPermiso = async () => {
            const ok1 = await tienePermisoRuta(['rh02'], userLog?.tipousuario?.id);
            setPuedeCrearModalidad(ok1);
        };

        if (userLog?.tipousuario?.id) {
            loadPermiso();
        }
    }, [userLog]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (detalleNoEliminar) {
                    setDetalleNoEliminar(false);
                } else {
                    setDetallesAEliminar([]);
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
        tipoturno: null,
        descripcion: "",
        horaent: "00:00",
        horasal: "00:00",
        horades: "00:00",
        thoras: 0,
        extporcen: 0,
        turnodia: []
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

    const guardarFn = async (turnoAGuardar) => {
        setTurnoAGuardar(null);
        setLoading(true);

        const nuevosDias = turnoAGuardar.turnodia.filter(d => {
            if (d.id === null) return true;
            return !detallesAEliminar.includes(d.id);
        });
        const turnoActualizado = { ...turnoAGuardar, turnodia: nuevosDias };

        if (turnoAGuardar.id) {
            await updateShift(turnoActualizado.id, turnoActualizado);
            await AddAccess('Modificar', turnoActualizado.id, userLog, "Turnos");
        } else {
            const nuevaTurno = await saveShift(turnoActualizado);
            await AddAccess('Insertar', nuevaTurno.saved.id, userLog, "Turnos");
        }
        setDetallesAEliminar([]);
        recuperarTurnos();
        setLoading(false);
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
        if (!turnoAGuardar.turnodia.length) {
            sw = 1;
            setDetalleNoEliminar(true);
        }
        if (!turnoAGuardar.tipoturno) sw = 1;

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...turnoAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
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
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="descripcion" className="form-label m-0 mb-2">Descripción</label>
                                            <input
                                                type="text"
                                                id="descripcion"
                                                name="descripcion"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.descripcion || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="horaent" className="form-label m-0 mb-2">Horarío de Entrada</label>
                                            <input
                                                type="time"
                                                id="horaent"
                                                name="horaent"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.horaent || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="horades" className="form-label m-0 mb-2">Tiempo de Descanso</label>
                                            <input
                                                type="time"
                                                id="horades"
                                                name="horades"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.horades || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="extporcen" className="form-label m-0 mb-2">Porcentaje</label>
                                            <input
                                                type="number"
                                                id="extporcen"
                                                name="extporcen"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.extporcen || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="tipoturno" className="form-label m-0 mb-2">Modalidad</label>
                                            <input
                                                type="text"
                                                id="tipoturno"
                                                name="tipoturno"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.tipoturno.tipo || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="horasal" className="form-label m-0 mb-2">Horarío de Salida</label>
                                            <input
                                                type="time"
                                                id="horasal"
                                                name="horasal"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.horasal || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="thoras" className="form-label m-0 mb-2">Total de Horas Semanales</label>
                                            <input
                                                type="number"
                                                id="thoras"
                                                name="thoras"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.thoras || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group bg-success mb-3 rounded-3 text-center w-100">
                                    <label className="form-label m-0 p-3 fw-bold fs-5 text-success-emphasis">Días del Turno</label>
                                    <div className="d-flex flex-wrap gap-xl-3 px-3 pb-3 justify-content-center">
                                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => {
                                            const estaMarcado = turnoAVisualizar.turnodia?.some((d) => d.dia === dia);
                                            return (
                                                <div className="form-check" key={dia}>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={dia}
                                                        checked={estaMarcado}
                                                        readOnly
                                                    />
                                                    <label className="form-check-label fw-semibold text-black" htmlFor={dia}>
                                                        {dia}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button onClick={() => setTurnoAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {turnoAGuardar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <form
                                    action="url.ph"
                                    onSubmit={handleSubmit}
                                    className="needs-validation"
                                    noValidate
                                >
                                    <div className="row mb-3 fw-semibold text-start">
                                        {/*Columna 1 de visualizar*/}
                                        <div className='col me-5 pe-0'>
                                            <div className="form-group mb-1">
                                                <label htmlFor="descripcion" className="form-label m-0 mb-2">Descripción</label>
                                                <input
                                                    type="text"
                                                    id="descripcion"
                                                    name="descripcion"
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={turnoAGuardar.descripcion || ''}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                    autoFocus
                                                    maxLength={150}
                                                    required
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La descripción es obligatoria y no debe sobrepasar los 150 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="horaent" className="form-label m-0 mb-2">Horarío de Entrada</label>
                                                <input
                                                    type="time"
                                                    id="horaent"
                                                    name="horaent"
                                                    className="form-control modern-input w-100"
                                                    value={turnoAGuardar.horaent || ''}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="horades" className="form-label m-0 mb-2">Tiempo de Descanso</label>
                                                <input
                                                    type="time"
                                                    id="horades"
                                                    name="horades"
                                                    className="form-control modern-input w-100"
                                                    value={turnoAGuardar.horades || ''}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="extporcen" className="form-label m-0 mb-2">Porcentaje</label>
                                                <input
                                                    type="number"
                                                    id="extporcen"
                                                    name="extporcen"
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={turnoAGuardar.extporcen || ''}
                                                    min={0}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="tipoturno" className="form-label m-0 mb-2">Modalidad</label>
                                                <i style={{ cursor: puedeCrearModalidad ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearModalidad ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearModalidad) {
                                                            await AddAccess('Consultar', 0, userLog, 'Modalidades')
                                                            navigate('/home/config/rrhh/schedules')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={modalidades}
                                                    value={turnoAGuardar.tipoturno}
                                                    getLabel={(v) => v.tipo}
                                                    searchFields={[
                                                        v => v.tipo
                                                    ]}
                                                    onChange={(v) =>
                                                        setTurnoAGuardar({
                                                            ...turnoAGuardar,
                                                            tipoturno: v
                                                        })
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="horasal" className="form-label m-0 mb-2">Horarío de Salida</label>
                                                <input
                                                    type="time"
                                                    id="horasal"
                                                    name="horasal"
                                                    className="form-control modern-input w-100"
                                                    value={turnoAGuardar.horasal || ''}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="thoras" className="form-label m-0 mb-2">Total de Horas Semanales</label>
                                                <input
                                                    type="number"
                                                    id="thoras"
                                                    name="thoras"
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={turnoAGuardar.thoras || ''}
                                                    min={0}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group bg-success mb-3 rounded-3 text-center w-100">
                                        <label className="form-label m-0 p-3 fw-bold fs-5 text-success-emphasis">Días del Turno</label>
                                        <div className="d-flex flex-wrap gap-xl-3 px-3 pb-3 justify-content-center">
                                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => {
                                                const estaMarcado = turnoAGuardar.turnodia?.some((d) => d.dia === dia);
                                                return (
                                                    <div className="form-check" key={dia}>
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={dia}
                                                            checked={estaMarcado}
                                                            onChange={(e) => {
                                                                const estaChequeado = e.target.checked;
                                                                const turnosActuales = turnoAGuardar.turnodia || [];
                                                                if (estaChequeado) {
                                                                    const yaExiste = turnosActuales.some((d) => d.dia === dia);
                                                                    if (!yaExiste) {
                                                                        const nuevosDias = [...turnosActuales, { id: null, dia }];
                                                                        setTurnoAGuardar({ ...turnoAGuardar, turnodia: nuevosDias });
                                                                    }
                                                                } else {
                                                                    const detalleEliminado = turnosActuales.find((d) => d.dia === dia);
                                                                    const nuevosDias = turnosActuales.filter((d) => d.dia !== dia);
                                                                    setTurnoAGuardar({ ...turnoAGuardar, turnodia: nuevosDias });
                                                                    if (detalleEliminado?.id != null) {
                                                                        setDetallesAEliminar((prev) => [...prev, detalleEliminado.id]);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <label className="form-check-label fw-semibold text-black" htmlFor={dia}>
                                                            {dia}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className='mt-4'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => {
                                            setTurnoAGuardar(null);
                                            setDetallesAEliminar([]);
                                        }}
                                            className="btn btn-danger ms-4 text-black fw-bold">
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
