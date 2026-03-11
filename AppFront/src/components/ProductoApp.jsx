import { useState, useEffect } from 'react';
import { getProduct, saveProduct, updateProduct, deleteProduct, updateErpProduct } from '../services/producto.service.js';
import { getEntity } from '../services/entidad.service.js';
import { getCommercial } from '../services/nombrecomercial.service.js';
import { getAsset } from '../services/principioactivo.service.js';
import { getCrop } from '../services/fasecultivo.service.js';
import { getProductType } from '../services/tipoproducto.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { obtenerClaseEstadoReg } from '../utils/StatusBadge.js';
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const ProductoApp = ({ userLog, setUserLog }) => {

    const [productos, setProductos] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [nombrecomerciales, setNombreComerciales] = useState([]);
    const [principioactivos, setPrincipioActivos] = useState([]);
    const [fasecultivos, setFaseCultivos] = useState([]);
    const [clases, setClases] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [productoAGuardar, setProductoAGuardar] = useState(null);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [productoNoEliminar, setProductoNoEliminar] = useState(null);
    const [productoAVisualizar, setProductoAVisualizar] = useState(null);
    const [productoErp, setProductoErp] = useState(null);
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
                setProductoAEliminar(null);
                setProductoNoEliminar(null);
                setProductoAVisualizar(null);
                setProductoAGuardar(null);
                setProductoErp(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selected = {
        id: null,
        entidad: null,
        nombrecomercial: null,
        principioactivo: null,
        fasecultivo: null,
        tipoproducto: null,
        dosisporhec: 0,
        costogerencial: 0,
        precio: 0,
        estado: "Activo",
        activo: true,
        incluirplan: false,
        obs: "",
        erpid: 0
    };
    const fieldSettings = {
        id: { hidden: true },
        entidad: {
            type: "object",
            options: entidades,
            searches: ['nomape', 'nrodoc'],
            label: "Entidad",
            getLabel: (item) => item?.nomape || "",
            module: ['ca01'],
            listPath: "/home/cadastres/entities",
            popupTitle: "Entidades"
        },
        nombrecomercial: {
            type: "object",
            options: nombrecomerciales,
            searches: ['nombrecomercial'],
            label: "Nombre Comercial",
            getLabel: (item) => item?.nombrecomercial || "",
            module: ['cm02'],
            listPath: "/home/config/commercial/tradenames",
            popupTitle: "Nombres Comerciales",
            notnull: true,
            order: 1,
            autofocus: true
        },
        principioactivo: {
            type: "object",
            options: principioactivos,
            searches: ['principioactivo'],
            label: "Principio Activo",
            getLabel: (item) => item?.principioactivo || "",
            module: ['pr03'],
            listPath: "/home/config/product/assets",
            popupTitle: "Principios Activos"
        },
        fasecultivo: {
            type: "object",
            options: fasecultivos,
            searches: ['fasecultivo'],
            label: "Fase de Cultivo",
            getLabel: (item) => item?.fasecultivo || "",
            module: ['gr01'],
            listPath: "/home/config/general/crops",
            popupTitle: "Fases de Cultivos"
        },
        tipoproducto: {
            type: "object",
            options: clases,
            searches: ['tipoproducto'],
            label: "Clase",
            getLabel: (item) => item?.tipoproducto || "",
            module: ['pr04'],
            listPath: "/home/config/product/classes",
            popupTitle: "Clases",
            notnull: true,
            order: 2
        },
        dosisporhec: { type: "number", label: "Dosis p/h" },
        costogerencial: { type: "number", label: "Costo Gerencial" },
        precio: { type: "number", label: "Precio" },
        estado: { type: "select", options: ["Activo", "Inactivo"], notnull: true },
        activo: { hidden: true },
        incluirplan: { type: "checkbox", label: "¿Incluir planeamiento?" },
        obs: { type: "textarea", label: "Observación" },
        erpid: { label: "ERPID", type: "number", hidden: userLog?.id !== 1 }
    };

    const recuperarProductos = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarEntidades = async () => {
        const response = await getEntity();
        setEntidades(response.items);
    }

    const recuperarNombreComerciales = async () => {
        const response = await getCommercial();
        setNombreComerciales(response.items);
    }

    const recuperarPrincipioActivos = async () => {
        const response = await getAsset();
        setPrincipioActivos(response.items);
    }

    const recuperarFaseCultivos = async () => {
        const response = await getCrop();
        setFaseCultivos(response.items);
    }

    const recuperarClases = async () => {
        const response = await getProductType();
        setClases(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:ca02`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getProduct(query.page, query.size, query.order, filtrosFinal);
            setProductos(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarEntidades();
        recuperarNombreComerciales();
        recuperarPrincipioActivos();
        recuperarFaseCultivos();
        recuperarClases();
    }, []);

    const eliminarProductoFn = async (id) => {
        setLoading(true);
        await deleteProduct(id);
        await AddAccess('Eliminar', id, userLog, "Productos");
        recuperarProductos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarProductoFn(id);
        setProductoAEliminar(null);
    }

    const handleEliminarProducto = async (producto) => {
        // const rel = await getProduct('', '', '', `:eq:${producto.id}`);
        // if (rel.items.length > 0) setProductoNoEliminar(producto);
        setProductoAEliminar(producto);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setProductoErp(null);
        await updateErpProduct();
        recuperarProductos();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setProductoAGuardar(null);
        setLoading(true);

        let activo = true;
        if (formData.estado == 'Inactivo') activo = false;

        const productoActualizado = {
            ...formData,
            activo: activo
        };

        if (productoActualizado.id) {
            await updateProduct(productoActualizado.id, productoActualizado);
            await AddAccess('Modificar', productoActualizado.id, userLog, "Productos");
        } else {
            const nuevoProducto = await saveProduct(productoActualizado);
            await AddAccess('Insertar', nuevoProducto.saved.id, userLog, "Productos");
        }
        recuperarProductos();
        setLoading(false);
        setProductoAGuardar(null);
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

    const rows = [...productos];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {productoErp && (
                <ImportErp setErp={setProductoErp} title={'productos'} fun={importarDatosERP} />
            )}
            {productoAEliminar && (
                <Delete setEliminar={setProductoAEliminar} title={'producto'} gen={true} confirmar={confirmarEliminacion} id={productoAEliminar.id} />
            )}
            {productoNoEliminar && (
                <NotDelete setNoEliminar={setProductoNoEliminar} title={'producto'} gen={true} />
            )}

            {productoAVisualizar && (
                <SmartModal
                    open={!!productoAVisualizar}
                    onClose={() => setProductoAVisualizar(null)}
                    title="Producto"
                    data={productoAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {productoAGuardar && (
                <SmartModal
                    open={!!productoAGuardar}
                    onClose={() => setProductoAGuardar(null)}
                    title="Producto"
                    data={productoAGuardar}
                    onSave={handleSubmit}
                    mode={productoAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'PRODUCTOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Productos
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
                                        <th onClick={() => toggleOrder("nombrecomercial.subgrupoproducto.grupoproductotxt")} className="sortable-header">
                                            Grupo
                                            <i className={`bi ${getSortIcon("nombrecomercial.subgrupoproducto.grupoproductotxt")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombrecomercial.subgrupoproducto.grupoproductotxt"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombrecomercial.subgrupoproducto.grupoproductotxt",
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
                                        <th onClick={() => toggleOrder("nombrecomercial.subgrupoproducto.subgrupoproducto")} className="sortable-header">
                                            Subgrupo
                                            <i className={`bi ${getSortIcon("nombrecomercial.subgrupoproducto.subgrupoproducto")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombrecomercial.subgrupoproducto.subgrupoproducto"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombrecomercial.subgrupoproducto.subgrupoproducto",
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
                                        <th onClick={() => toggleOrder("nombrecomercial.nombrecomercial")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("nombrecomercial.nombrecomercial")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombrecomercial.nombrecomercial"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombrecomercial.nombrecomercial",
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
                                        <th onClick={() => toggleOrder("tipoproducto.tipoproducto")} className="sortable-header">
                                            Clase
                                            <i className={`bi ${getSortIcon("tipoproducto.tipoproducto")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["tipoproducto.tipoproducto"] ?? {};
                                                    setFiltroActivo({
                                                        field: "tipoproducto.tipoproducto",
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
                                    {productos.length === 0 ? (
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
                                                        if (puedeEditar) setProductoAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.nombrecomercial?.subgrupoproducto?.grupoproductotxt}</td>
                                                    <td className='text-start'>{v.nombrecomercial?.subgrupoproducto?.subgrupoproducto}</td>
                                                    <td className='text-start'>{v.nombrecomercial?.nombrecomercial}</td>
                                                    <td>{v.tipoproducto?.tipoproducto}</td>
                                                    <td style={{ width: '140px' }}>
                                                        <p className={`text-center mx-auto w-75 ${obtenerClaseEstadoReg(v.activo)} m-0 rounded-2 border border-black`}>
                                                            {v.estado}
                                                        </p>
                                                    </td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarProducto(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Productos");
                                                                    setProductoAVisualizar(v);
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
                            onAdd={() => setProductoAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setProductoErp(true)}
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
