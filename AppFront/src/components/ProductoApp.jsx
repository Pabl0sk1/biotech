import { useState, useEffect } from 'react';
import { getProduct, saveProduct, updateProduct, deleteProduct, updateErpProduct } from '../services/producto.service.js';
import { getEntity } from '../services/entidad.service.js';
import { getCommercial } from '../services/nombrecomercial.service.js';
import { getAsset } from '../services/principioactivo.service.js';
import { getCrop } from '../services/fasecultivo.service.js';
import { getProductType } from '../services/tipoproducto.service.js';
import { getPermission } from '../services/permiso.service.js';
import { getCommission } from '../services/comision.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
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
    const [comisiones, setComisiones] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [productoAGuardar, setProductoAGuardar] = useState(null);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [productoNoEliminar, setProductoNoEliminar] = useState(null);
    const [productoAVisualizar, setProductoAVisualizar] = useState(null);
    const [productoErp, setProductoErp] = useState(null);
    const [loading, setLoading] = useState(false);
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
        id: { disabled: true, order: 0 },
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
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        nombrecomercial: { label: "Nombre Comercial", type: "string", field: "nombrecomercial.nombrecomercial", classname: "text-start", default: true },
        entidad: { label: "Entidad", type: "string", field: "entidad.nomape", classname: "text-start" },
        principioactivo: { label: "Principio Activo", type: "string", field: "principioactivo.principioactivo", classname: "text-start", default: true },
        fasecultivo: { label: "Fase de Cultivo", type: "string", field: "fasecultivo.fasecultivo", classname: "text-start" },
        tipoproducto: { label: "Clase", type: "string", field: "tipoproducto.tipoproducto", classname: "text-start", default: true },
        dosisporhec: { label: "Dosis p/h", type: "number", classname: "text-end" },
        costogerencial: { label: "Costo Gerencial", type: "number", classname: "text-end" },
        precio: { label: "Precio", type: "number", classname: "text-end", default: true },
        estado: {
            label: "Estado",
            type: "string",
            default: true,
            render: {
                rentype: "statusreg",
                renval1: "activo",
                renval2: "estado"
            }
        },
        activo: { hidden: true },
        incluirplan: {
            label: "¿Incluir en planeamiento?",
            type: "boolean"
        },
        obs: { label: "Observación", type: "string", classname: "text-start" },
        erpid: { label: "ERPID", type: "number", classname: "text-end", hidden: userLog?.id !== 1 }
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

    const recuperarComisiones = async () => {
        const response = await getCommission();
        setComisiones(response.items);
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
        recuperarComisiones();
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

    const importarDatosERP = async () => {
        setLoading(true);
        setProductoErp(null);
        await updateErpProduct();
        await AddAccess('Importar', 0, userLog, "Productos");
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

    const handleSubmit = (formData) => {
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    };

    const handleViewProducto = async (producto) => {
        await AddAccess('Visualizar', producto.id, userLog, "Productos");
        setProductoAVisualizar(producto);
    };

    const handleEditProducto = (producto) => {
        setProductoAGuardar(producto);
    };

    const handleDeleteProducto = async (producto) => {
        const rel = await getCommission('', '', '', `producto.id:eq:${producto.id}`);
        if (rel.items.length > 0) {
            setProductoNoEliminar(producto);
        } else {
            setProductoAEliminar(producto);
        }
    };

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

            <Header userLog={userLog} title={'PRODUCTOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={productos}
                userLog={userLog}
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
                onEdit={handleEditProducto}
                onDelete={handleDeleteProducto}
                onView={handleViewProducto}
                canEdit={permiso?.puedeeditar}
                canDelete={permiso?.puedeeliminar}
                canView={permiso?.puedever}
                columnSettings={columnSettings}
            />
        </>
    );
};
