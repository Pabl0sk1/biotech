import { useState, useEffect } from 'react';
import { getCrop, saveCrop, updateCrop, deleteCrop, updateErpCrop } from '../services/fasecultivo.service.js';
import { getProduct } from '../services/producto.service.js';
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

export const FaseCultivoApp = ({ userLog }) => {

    const [fasecultivos, setFaseCultivos] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [fasecultivoAGuardar, setFaseCultivoAGuardar] = useState(null);
    const [fasecultivoAEliminar, setFaseCultivoAEliminar] = useState(null);
    const [fasecultivoNoEliminar, setFaseCultivoNoEliminar] = useState(null);
    const [fasecultivoAVisualizar, setFaseCultivoAVisualizar] = useState(null);
    const [fasecultivoErp, setFaseCultivoErp] = useState(null);
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
                setFaseCultivoAEliminar(null);
                setFaseCultivoNoEliminar(null);
                setFaseCultivoAVisualizar(null);
                setFaseCultivoAGuardar(null);
                setFaseCultivoErp(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selected = {
        id: null,
        fasecultivo: "",
        erpid: 0
    };
    const fieldSettings = {
        id: { hidden: true },
        fasecultivo: { label: "Descripción", notnull: true, autofocus: true },
        erpid: { hidden: userLog?.id !== 1, type: "number", label: "ERPID" }
    };

    const recuperarFaseCultivos = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:gr01`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getCrop(query.page, query.size, query.order, filtrosFinal);
            setFaseCultivos(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarFaseCultivoFn = async (id) => {
        setLoading(true);
        await deleteCrop(id);
        await AddAccess('Eliminar', id, userLog, "Fase de Cultivos");
        recuperarFaseCultivos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFaseCultivoFn(id);
        setFaseCultivoAEliminar(null);
    }

    const handleEliminarFaseCultivo = async (fasecultivo) => {
        const rel = await getProduct('', '', '', `fasecultivo.id:eq:${fasecultivo?.id}`);
        if (rel.items.length > 0) setFaseCultivoNoEliminar(fasecultivo);
        else setFaseCultivoAEliminar(fasecultivo);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setFaseCultivoErp(null);
        await updateErpCrop();
        recuperarFaseCultivos();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const fasecultivoAGuardar = { ...formData };

        if (fasecultivoAGuardar.id) {
            await updateCrop(fasecultivoAGuardar.id, fasecultivoAGuardar);
            await AddAccess('Modificar', fasecultivoAGuardar.id, userLog, "Fase de Cultivos");
        } else {
            const nuevoFaseCultivo = await saveCrop(fasecultivoAGuardar);
            await AddAccess('Insertar', nuevoFaseCultivo.saved.id, userLog, "Fase de Cultivos");
        }
        recuperarFaseCultivos();
        setLoading(false);
        setFaseCultivoAGuardar(null);
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

    const rows = [...fasecultivos];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {fasecultivoErp && (
                <ImportErp setErp={setFaseCultivoErp} title={'fases de cultivos'} fun={importarDatosERP} />
            )}
            {fasecultivoAEliminar && (
                <Delete setEliminar={setFaseCultivoAEliminar} title={'fase de cultivo'} gen={false} confirmar={confirmarEliminacion} id={fasecultivoAEliminar.id} />
            )}
            {fasecultivoNoEliminar && (
                <NotDelete setNoEliminar={setFaseCultivoNoEliminar} title={'fase de cultivo'} gen={false} />
            )}

            {fasecultivoAVisualizar && (
                <SmartModal
                    open={!!fasecultivoAVisualizar}
                    onClose={() => setFaseCultivoAVisualizar(null)}
                    title="Fase de Cultivo"
                    data={fasecultivoAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {fasecultivoAGuardar && (
                <SmartModal
                    open={!!fasecultivoAGuardar}
                    onClose={() => setFaseCultivoAGuardar(null)}
                    title="Fase de Cultivo"
                    data={fasecultivoAGuardar}
                    onSave={handleSubmit}
                    mode={fasecultivoAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'FASE DE CULTIVOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Fase de Cultivos
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
                                        <th onClick={() => toggleOrder("fasecultivo")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("fasecultivo")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["fasecultivo"] ?? {};
                                                    setFiltroActivo({
                                                        field: "fasecultivo",
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
                                    {fasecultivos.length === 0 ? (
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
                                                        if (puedeEditar) setFaseCultivoAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.fasecultivo}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarFaseCultivo(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Fase de Cultivos");
                                                                    setFaseCultivoAVisualizar(v);
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
                            onAdd={() => setFaseCultivoAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setFaseCultivoErp(true)}
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
