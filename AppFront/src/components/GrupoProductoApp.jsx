import { useState, useEffect } from 'react';
import { getProductGroup, saveProductGroup, updateProductGroup, deleteProductGroup, updateErpProductGroup } from '../services/grupoproducto.service.js';
import { getCurrency } from '../services/moneda.service.js';
import { getTaxation } from '../services/tributaciones.service.js';
import { getCommercial } from '../services/nombrecomercial.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const GrupoProductoApp = ({ userLog }) => {

    const [grupoproductos, setGrupoProductos] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [tributaciones, setTributaciones] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [grupoproductoAGuardar, setGrupoProductoAGuardar] = useState(null);
    const [grupoproductoAEliminar, setGrupoProductoAEliminar] = useState(null);
    const [grupoproductoNoEliminar, setGrupoProductoNoEliminar] = useState(null);
    const [grupoproductoAVisualizar, setGrupoProductoAVisualizar] = useState(null);
    const [grupoproductoErp, setGrupoProductoErp] = useState(null);
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
                setGrupoProductoAEliminar(null);
                setGrupoProductoNoEliminar(null);
                setGrupoProductoAVisualizar(null);
                setGrupoProductoAGuardar(null);
                setGrupoProductoErp(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selected = {
        id: null,
        tributacion: null,
        moneda: null,
        grupoproducto: "",
        erpid: 0
    };
    const fieldSettings = {
        id: { hidden: true },
        grupoproducto: { label: "Descripción", notnull: true },
        tributacion: {
            type: "object",
            options: tributaciones,
            searches: ['tributacion'],
            label: "Tributación",
            getLabel: (item) => item?.tributacion || "",
            module: ['gr04'],
            listPath: "/home/config/general/taxations",
            popupTitle: "Tributaciones",
            order: 1,
            autofocus: true
        },
        moneda: {
            type: "object",
            options: monedas,
            searches: ['moneda'],
            label: "Moneda",
            getLabel: (item) => item?.moneda || "",
            module: ['gr02'],
            listPath: "/home/config/general/currencies",
            popupTitle: "Monedas",
            notnull: true,
            order: 2
        },
        erpid: { hidden: userLog?.id !== 1, type: "number", label: "ERPID" },
        subgrupoproducto: { hidden: true }
    };

    const recuperarGrupoProductos = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarTributaciones = async () => {
        const response = await getTaxation();
        setTributaciones(response.items);
    }

    const recuperarMonedas = async () => {
        const response = await getCurrency();
        setMonedas(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:pr01`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getProductGroup(query.page, query.size, query.order, filtrosFinal);
            setGrupoProductos(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarTributaciones();
        recuperarMonedas();
    }, []);

    const eliminarGrupoProductoFn = async (id) => {
        setLoading(true);
        await deleteProductGroup(id);
        await AddAccess('Eliminar', id, userLog, "Grupos de Productos");
        recuperarGrupoProductos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarGrupoProductoFn(id);
        setGrupoProductoAEliminar(null);
    }

    const handleEliminarGrupoProducto = async (grupoproducto) => {
        const rel = await getCommercial('', '', '', `subgrupoproducto.grupoproducto.id:eq:${grupoproducto.id}`);
        if (rel.items.length > 0) setGrupoProductoNoEliminar(grupoproducto);
        else setGrupoProductoAEliminar(grupoproducto);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setGrupoProductoErp(null);
        await updateErpProductGroup();
        recuperarGrupoProductos();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const grupoproductoAGuardar = { ...formData };

        if (grupoproductoAGuardar.id) {
            await updateProductGroup(grupoproductoAGuardar.id, grupoproductoAGuardar);
            await AddAccess('Modificar', grupoproductoAGuardar.id, userLog, "Grupos de Productos");
        } else {
            const nuevoGrupoProducto = await saveProductGroup(grupoproductoAGuardar);
            await AddAccess('Insertar', nuevoGrupoProducto.saved.id, userLog, "Grupos de Productos");
        }
        recuperarGrupoProductos();
        setLoading(false);
        setGrupoProductoAGuardar(null);
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
    };

    const rows = [...grupoproductos];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {grupoproductoErp && (
                <ImportErp setErp={setGrupoProductoErp} title={'grupos de productos'} fun={importarDatosERP} />
            )}
            {grupoproductoAEliminar && (
                <Delete setEliminar={setGrupoProductoAEliminar} title={'grupo de producto'} gen={true} confirmar={confirmarEliminacion} id={grupoproductoAEliminar.id} />
            )}
            {grupoproductoNoEliminar && (
                <NotDelete setNoEliminar={setGrupoProductoNoEliminar} title={'grupo de producto'} gen={true} />
            )}

            {grupoproductoAVisualizar && (
                <SmartModal
                    open={!!grupoproductoAVisualizar}
                    onClose={() => setGrupoProductoAVisualizar(null)}
                    title="Grupo de Producto"
                    data={grupoproductoAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {grupoproductoAGuardar && (
                <SmartModal
                    open={!!grupoproductoAGuardar}
                    onClose={() => setGrupoProductoAGuardar(null)}
                    title="Grupo de Producto"
                    data={grupoproductoAGuardar}
                    onSave={handleSubmit}
                    mode={grupoproductoAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'GRUPOS DE PRODUCTOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Grupos de Productos
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
                                        <th onClick={() => toggleOrder("grupoproducto")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("grupoproducto")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["grupoproducto"] ?? {};
                                                    setFiltroActivo({
                                                        field: "grupoproducto",
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
                                        <th onClick={() => toggleOrder("moneda.moneda")} className="sortable-header">
                                            Moneda
                                            <i className={`bi ${getSortIcon("moneda.moneda")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["moneda.moneda"] ?? {};
                                                    setFiltroActivo({
                                                        field: "moneda.moneda",
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
                                        <th onClick={() => toggleOrder("tributacion.tributacion")} className="sortable-header">
                                            Tributación
                                            <i className={`bi ${getSortIcon("tributacion.tributacion")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["tributacion.tributacion"] ?? {};
                                                    setFiltroActivo({
                                                        field: "tributacion.tributacion",
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
                                    {grupoproductos.length === 0 ? (
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
                                                        if (puedeEditar) setGrupoProductoAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.grupoproducto}</td>
                                                    <td>{v.moneda?.moneda}</td>
                                                    <td>{v.tributacion?.tributacion}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarGrupoProducto(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "GrupoProductos");
                                                                    setGrupoProductoAVisualizar(v);
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
                            onAdd={() => setGrupoProductoAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setGrupoProductoErp(true)}
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
