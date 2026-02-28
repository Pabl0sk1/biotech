import { useState, useEffect } from 'react';
import { getCurrency, saveCurrency, updateCurrency, deleteCurrency, updateErpCurrency } from '../services/moneda.service.js';
import { getProductGroup } from '../services/grupoproducto.service.js';
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

export const MonedaApp = ({ userLog }) => {

    const [monedas, setMonedas] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [monedaAGuardar, setMonedaAGuardar] = useState(null);
    const [monedaAEliminar, setMonedaAEliminar] = useState(null);
    const [monedaNoEliminar, setMonedaNoEliminar] = useState(null);
    const [monedaAVisualizar, setMonedaAVisualizar] = useState(null);
    const [monedaErp, setMonedaErp] = useState(null);
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
                setMonedaAEliminar(null);
                setMonedaNoEliminar(null);
                setMonedaAVisualizar(null);
                setMonedaAGuardar(null);
                setMonedaErp(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selected = {
        id: null,
        moneda: "",
        simbolo: "",
        codiso: "",
        erpid: 0
    };
    const fieldSettings = {
        id: { hidden: true },
        moneda: { label: "Descripción", notnull: true, autofocus: true },
        simbolo: { label: "Símbolo" },
        codiso: { label: "Código ISO" },
        erpid: { label: "ERPID", type: "number", hidden: userLog?.id !== 1 }
    };

    const recuperarMonedas = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:gr02`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getCurrency(query.page, query.size, query.order, filtrosFinal);
            setMonedas(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarMonedaFn = async (id) => {
        setLoading(true);
        await deleteCurrency(id);
        await AddAccess('Eliminar', id, userLog, "Monedas");
        recuperarMonedas();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarMonedaFn(id);
        setMonedaAEliminar(null);
    }

    const handleEliminarMoneda = async (moneda) => {
        const rel = await getProductGroup('', '', '', `moneda.id:eq:${moneda?.id}`);
        if (rel.items.length > 0) setMonedaNoEliminar(moneda);
        else setMonedaAEliminar(moneda);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setMonedaErp(null);
        await updateErpCurrency();
        recuperarMonedas();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const monedaAGuardar = { ...formData };

        if (monedaAGuardar.id) {
            await updateCurrency(monedaAGuardar.id, monedaAGuardar);
            await AddAccess('Modificar', monedaAGuardar.id, userLog, "Monedas");
        } else {
            const nuevoMoneda = await saveCurrency(monedaAGuardar);
            await AddAccess('Insertar', nuevoMoneda.saved.id, userLog, "Monedas");
        }
        recuperarMonedas();
        setLoading(false);
        setMonedaAGuardar(null);
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

    const rows = [...monedas];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {monedaErp && (
                <ImportErp setErp={setMonedaErp} title={'monedas'} fun={importarDatosERP} />
            )}
            {monedaAEliminar && (
                <Delete setEliminar={setMonedaAEliminar} title={'moneda'} gen={false} confirmar={confirmarEliminacion} id={monedaAEliminar.id} />
            )}
            {monedaNoEliminar && (
                <NotDelete setNoEliminar={setMonedaNoEliminar} title={'moneda'} gen={false} />
            )}

            {monedaAVisualizar && (
                <SmartModal
                    open={!!monedaAVisualizar}
                    onClose={() => setMonedaAVisualizar(null)}
                    title="Moneda"
                    data={monedaAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {monedaAGuardar && (
                <SmartModal
                    open={!!monedaAGuardar}
                    onClose={() => setMonedaAGuardar(null)}
                    title="Moneda"
                    data={monedaAGuardar}
                    onSave={handleSubmit}
                    mode={monedaAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'MONEDAS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Monedas
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
                                        <th onClick={() => toggleOrder("moneda")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("moneda")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["moneda"] ?? {};
                                                    setFiltroActivo({
                                                        field: "moneda",
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
                                        <th onClick={() => toggleOrder("codiso")} className="sortable-header">
                                            Código ISO
                                            <i className={`bi ${getSortIcon("codiso")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["codiso"] ?? {};
                                                    setFiltroActivo({
                                                        field: "codiso",
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
                                    {monedas.length === 0 ? (
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
                                                        if (puedeEditar) setMonedaAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.moneda}</td>
                                                    <td>{v.codiso}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarMoneda(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Monedas");
                                                                    setMonedaAVisualizar(v);
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
                            onAdd={() => setMonedaAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setMonedaErp(true)}
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
