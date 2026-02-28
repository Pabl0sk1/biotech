import { useState, useEffect } from 'react';
import { getWallet, saveWallet, updateWallet, deleteWallet, updateErpWallet } from '../services/cartera.service.js';
import { getEntity } from '../services/entidad.service.js';
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

export const CarteraApp = ({ userLog }) => {

    const [carteras, setCarteras] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [carteraAGuardar, setCarteraAGuardar] = useState(null);
    const [carteraAEliminar, setCarteraAEliminar] = useState(null);
    const [carteraNoEliminar, setCarteraNoEliminar] = useState(null);
    const [carteraAVisualizar, setCarteraAVisualizar] = useState(null);
    const [carteraErp, setCarteraErp] = useState(null);
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
                setCarteraAEliminar(null);
                setCarteraNoEliminar(null);
                setCarteraAVisualizar(null);
                setCarteraAGuardar(null);
                setCarteraErp(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selected = {
        id: null,
        entidadid: 0,
        nombre: "",
        region: "",
        erpid: 0
    };
    const fieldSettings = {
        id: { hidden: true },
        nombre: { label: "Descripción", notnull: true, order: 1, autofocus: true },
        region: { label: "Región", notnull: true, order: 2 },
        entidadid: { type: "number", label: "Entidad ID" },
        erpid: { hidden: userLog?.id !== 1, type: "number", label: "ERPID" }
    };

    const recuperarCarteras = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:cm01`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getWallet(query.page, query.size, query.order, filtrosFinal);
            setCarteras(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarCarteraFn = async (id) => {
        setLoading(true);
        await deleteWallet(id);
        await AddAccess('Eliminar', id, userLog, "Carteras");
        recuperarCarteras();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarCarteraFn(id);
        setCarteraAEliminar(null);
    }

    const handleEliminarCartera = async (cartera) => {
        const rel = await getEntity('', '', '', `cartera.id:eq:${cartera?.id}`);
        if (rel.items.length > 0) setCarteraNoEliminar(cartera);
        else setCarteraAEliminar(cartera);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setCarteraErp(null);
        await updateErpWallet();
        recuperarCarteras();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const carteraAGuardar = { ...formData };

        if (carteraAGuardar.id) {
            await updateWallet(carteraAGuardar.id, carteraAGuardar);
            await AddAccess('Modificar', carteraAGuardar.id, userLog, "Carteras");
        } else {
            const nuevoCartera = await saveWallet(carteraAGuardar);
            await AddAccess('Insertar', nuevoCartera.saved.id, userLog, "Carteras");
        }
        recuperarCarteras();
        setLoading(false);
        setCarteraAGuardar(null);
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

    const rows = [...carteras];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {carteraErp && (
                <ImportErp setErp={setCarteraErp} title={'carteras'} fun={importarDatosERP} />
            )}
            {carteraAEliminar && (
                <Delete setEliminar={setCarteraAEliminar} title={'cartera'} gen={false} confirmar={confirmarEliminacion} id={carteraAEliminar.id} />
            )}
            {carteraNoEliminar && (
                <NotDelete setNoEliminar={setCarteraNoEliminar} title={'cartera'} gen={false} />
            )}

            {carteraAVisualizar && (
                <SmartModal
                    open={!!carteraAVisualizar}
                    onClose={() => setCarteraAVisualizar(null)}
                    title="Cartera"
                    data={carteraAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {carteraAGuardar && (
                <SmartModal
                    open={!!carteraAGuardar}
                    onClose={() => setCarteraAGuardar(null)}
                    title="Cartera"
                    data={carteraAGuardar}
                    onSave={handleSubmit}
                    mode={carteraAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'CARTERAS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Carteras
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
                                        <th onClick={() => toggleOrder("nombre")} className="sortable-header">
                                            Vendedor
                                            <i className={`bi ${getSortIcon("nombre")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombre"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombre",
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
                                        <th onClick={() => toggleOrder("region")} className="sortable-header">
                                            Región
                                            <i className={`bi ${getSortIcon("region")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["region"] ?? {};
                                                    setFiltroActivo({
                                                        field: "region",
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
                                    {carteras.length === 0 ? (
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
                                                        if (puedeEditar) setCarteraAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.nombre}</td>
                                                    <td>{v.region}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarCartera(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Carteras");
                                                                    setCarteraAVisualizar(v);
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
                            onAdd={() => setCarteraAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setCarteraErp(true)}
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
