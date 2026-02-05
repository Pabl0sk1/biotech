import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReport, deleteReport, deleteReportData } from '../services/informe.service.js';
import { getReportType } from '../services/tipoinforme.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { obtenerClaseEstadoInf } from '../utils/StatusBadge.js';
import { DateHourFormat } from '../utils/DateHourFormat.js';
import { FiltroModal } from "../FiltroModal.jsx";
import { generarExcel } from '../tasks/ArchivoExcel.jsx';
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';
import SaveModal from '../layouts/SaveModal.jsx';

export const HoraExtraApp = ({ userLog }) => {

    const navigate = useNavigate();
    const [horasextras, setHorasExtras] = useState([]);
    const [tipo, setTipo] = useState({});
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [horaextraAGuardar, setHoraExtraAGuardar] = useState(null);
    const [horaextraAEliminar, setHoraExtraAEliminar] = useState(null);
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
                setHoraExtraAEliminar(null);
                setHoraExtraAGuardar(null);
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
        usuario: { ...userLog },
        tipoinforme: { ...tipo },
        descripcion: "",
        fechacreacion: new Date(),
        fechaactualizacion: new Date(),
        estado: "Borrador"
    }

    const generarArchivo = (data) => {
        const dataParsed = JSON.parse(data);
        generarExcel(dataParsed);
    }

    const recuperarHorasExtras = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:rh04`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getReport(query.page, query.size, query.order, 'tipoinforme.id:eq:1;' + filtrosFinal);
            setHorasExtras(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        const cargarTipo = async () => {
            const tp = await getReportType('', '', '', 'id:eq:1');
            setTipo(tp.items[0]);
        }
        cargarTipo();
    }, []);

    const eliminarHoraExtraFn = async (id) => {
        setLoading(true);
        await deleteReportData(id);
        await deleteReport(id);
        await AddAccess('Eliminar', id, userLog, "Horas Extras");
        recuperarHorasExtras();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarHoraExtraFn(id);
        setHoraExtraAEliminar(null);
    }

    const handleEliminarHoraExtra = async (horaextra) => {
        // const rel = await getProduct('', '', '', `tipoproducto.id:eq:${horaextra?.id}`);
        // if (rel.items.length > 0) setHoraExtraNoEliminar(horaextra);
        setHoraExtraAEliminar(horaextra);
    };

    const guardarFn = async (datos, modoEdicion) => {
        setHoraExtraAGuardar(null);
        if (datos?.id) navigate(`/home/main/rrhh/calcext/${datos.id}`, {
            state: { userLog, datos, modoEdicion }
        });
        else navigate(`/home/main/rrhh/calcext/${selected.id}`, {
            state: { userLog, datos: selected, modoEdicion: true }
        });
        recuperarHorasExtras();
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

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    }

    const rows = [...horasextras];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {horaextraAEliminar && (
                <Delete setEliminar={setHoraExtraAEliminar} title={'hora extra'} gen={false} confirmar={confirmarEliminacion} id={horaextraAEliminar.id} />
            )}
            {horaextraAGuardar && (
                <SaveModal setGuardar={setHoraExtraAGuardar} title={'hora extra'} gen={false} fun={guardarFn} />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'HORAS EXTRAS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Horas Extras
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
                                        <th onClick={() => toggleOrder("fechacreacion")} className="sortable-header">
                                            Fecha de Creación
                                            <i className={`bi ${getSortIcon("fechacreacion")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["fechacreacion"] ?? {};
                                                    setFiltroActivo({
                                                        field: "fechacreacion",
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
                                        <th onClick={() => toggleOrder("fechaactualizacion")} className="sortable-header">
                                            Fecha de Actualización
                                            <i className={`bi ${getSortIcon("fechaactualizacion")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["fechaactualizacion"] ?? {};
                                                    setFiltroActivo({
                                                        field: "fechaactualizacion",
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
                                    {horasextras.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-3 text-muted fs-3 fw-bold">
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.filter(v => v).map((v, index) => {
                                            const puedeEditar = permiso?.puedeeditar && (v.estado == 'Borrador' || userLog?.id == 1);
                                            const puedeEliminar = permiso?.puedeeliminar && (v.estado == 'Borrador' || userLog?.id == 1);
                                            const puedeVer = permiso?.puedever;
                                            const puedeInforme = v.estado == 'Aprobado';
                                            return (
                                                <tr
                                                    className="text-center align-middle"
                                                    key={v ? v.id : `empty-${index}`}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (puedeEditar) await guardarFn(v, true);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.descripcion}</td>
                                                    <td>{DateHourFormat(v.fechacreacion, 0)}</td>
                                                    <td>{DateHourFormat(v.fechaactualizacion, 0)}</td>
                                                    <td style={{ width: '140px' }}>
                                                        <p className={`text-center mx-auto w-75 ${obtenerClaseEstadoInf(v.estado)} m-0 rounded-2 border border-black`}>
                                                            {v.estado}
                                                        </p>
                                                    </td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarHoraExtra(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Horas Extras");
                                                                    await guardarFn(v, false);
                                                                }
                                                            }}
                                                            className="btn border-0 ms-2 me-2 p-0"
                                                            style={{ cursor: puedeVer ? 'pointer' : 'default' }}
                                                        >
                                                            <i className={`bi bi-eye-fill ${puedeVer ? 'text-primary' : 'text-primary-emphasis'}`}></i>
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (puedeInforme) {
                                                                    await AddAccess('Informe', v.id, userLog, "Horas Extras");
                                                                    generarArchivo(v.data);
                                                                }
                                                            }}
                                                            className="btn border-0 ms-2 p-0"
                                                            style={{ cursor: puedeInforme ? 'pointer' : 'default' }}
                                                        >
                                                            <i className={`bi bi-file-earmark-text-fill ${puedeInforme ? 'text-secondary' : 'text-secondary-emphasis'}`}></i>
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
                            onAdd={() => setHoraExtraAGuardar(true)}
                            onRefresh={refrescar}
                            canAdd={permiso?.puedeagregar}
                            canImport={permiso?.puedeimportar}
                            showErpButton={false}
                            showAddButton={true}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
