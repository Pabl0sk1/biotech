import { useState, useEffect } from 'react';
import { getMeasure, saveMeasure, updateMeasure, deleteMeasure, updateErpMeasure } from '../services/medida.service.js';
import { getCommercial } from '../services/nombrecomercial.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from "../FiltroModal.jsx";
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const MedidaApp = ({ userLog }) => {

    const [medidas, setMedidas] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [medidaAGuardar, setMedidaAGuardar] = useState(null);
    const [medidaAEliminar, setMedidaAEliminar] = useState(null);
    const [medidaNoEliminar, setMedidaNoEliminar] = useState(null);
    const [medidaAVisualizar, setMedidaAVisualizar] = useState(null);
    const [medidaErp, setMedidaErp] = useState(null);
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
                setMedidaAEliminar(null);
                setMedidaNoEliminar(null);
                setMedidaAVisualizar(null);
                setMedidaAGuardar(null);
                setMedidaErp(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selected = {
        id: null,
        medida: "",
        abreviatura: "",
        erpid: 0
    };
    const fieldSettings = {
        id: { hidden: true },
        medida: { label: "Descripción", notnull: true, autofocus: true },
        erpid: { hidden: userLog?.id !== 1, type: "number", label: "ERPID" }
    };

    const recuperarMedidas = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:pr02`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getMeasure(query.page, query.size, query.order, filtrosFinal);
            setMedidas(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarMedidaFn = async (id) => {
        setLoading(true);
        await deleteMeasure(id);
        await AddAccess('Eliminar', id, userLog, "Medidas");
        recuperarMedidas();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarMedidaFn(id);
        setMedidaAEliminar(null);
    }

    const handleEliminarMedida = async (medida) => {
        const rel = await getCommercial('', '', '', `medida.id:eq:${medida?.id}`);
        if (rel.items.length > 0) setMedidaNoEliminar(medida);
        else setMedidaAEliminar(medida);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setMedidaErp(null);
        await updateErpMeasure();
        recuperarMedidas();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const medidaAGuardar = { ...formData };

        if (medidaAGuardar.id) {
            await updateMeasure(medidaAGuardar.id, medidaAGuardar);
            await AddAccess('Modificar', medidaAGuardar.id, userLog, "Medidas");
        } else {
            const nuevoMedida = await saveMeasure(medidaAGuardar);
            await AddAccess('Insertar', nuevoMedida.saved.id, userLog, "Medidas");
        }
        recuperarMedidas();
        setLoading(false);
        setMedidaAGuardar(null);
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

    const rows = [...medidas];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {medidaErp && (
                <ImportErp setErp={setMedidaErp} title={'medidas'} fun={importarDatosERP} />
            )}
            {medidaAEliminar && (
                <Delete setEliminar={setMedidaAEliminar} title={'medida'} gen={false} confirmar={confirmarEliminacion} id={medidaAEliminar.id} />
            )}
            {medidaNoEliminar && (
                <NotDelete setNoEliminar={setMedidaNoEliminar} title={'medida'} gen={false} />
            )}

            {medidaAVisualizar && (
                <SmartModal
                    open={!!medidaAVisualizar}
                    onClose={() => setMedidaAVisualizar(null)}
                    title="Medida"
                    data={medidaAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {medidaAGuardar && (
                <SmartModal
                    open={!!medidaAGuardar}
                    onClose={() => setMedidaAGuardar(null)}
                    title="Medida"
                    data={medidaAGuardar}
                    onSave={handleSubmit}
                    mode={medidaAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'MEDIDAS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Medidas
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
                                        <th onClick={() => toggleOrder("medida")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("medida")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["medida"] ?? {};
                                                    setFiltroActivo({
                                                        field: "medida",
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
                                    {medidas.length === 0 ? (
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
                                                        if (puedeEditar) setMedidaAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.medida}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarMedida(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Medidas");
                                                                    setMedidaAVisualizar(v);
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
                            onAdd={() => setMedidaAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setMedidaErp(true)}
                            canAdd={permiso?.puedeagregar}
                            canImport={permiso?.puedeimportar}
                            showErpButton={true}
                            showAddButton={true}
                            addData={selected}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
