import { useState, useEffect } from 'react';
import { getProductGroup, saveProductGroup, updateProductGroup, deleteProductGroup, updateErpProductGroup } from '../services/grupoproducto.service.js';
import { getCurrency } from '../services/moneda.service.js';
import { getTaxation } from '../services/tributaciones.service.js';
import { getCommercial } from '../services/nombrecomercial.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const GrupoProductoApp = ({ userLog, setUserLog }) => {

    const [grupoproductos, setGrupoProductos] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [tributaciones, setTributaciones] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rowAGuardar, setRowAGuardar] = useState(null);
    const [rowAEliminar, setRowAEliminar] = useState(null);
    const [rowNoEliminar, setRowNoEliminar] = useState(null);
    const [rowAVisualizar, setRowAVisualizar] = useState(null);
    const [rowErp, setRowErp] = useState(null);
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
                setRowAEliminar(null);
                setRowNoEliminar(null);
                setRowAVisualizar(null);
                setRowAGuardar(null);
                setRowErp(null);
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
        id: { type: "number", disabledonlyedit: true, order: 0 },
        grupoproducto: { label: "Descripción", notnull: true, size: 150 },
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
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        grupoproducto: { label: "Descripción", type: "string", classname: "text-start", default: true },
        tributacion: { label: "Tributación", type: "string", field: "tributacion.tributacion", classname: "text-start" },
        moneda: { label: "Moneda", type: "string", field: "moneda.moneda", classname: "text-start" },
        erpid: { label: "ERPID", type: "number", classname: "text-end", hidden: userLog?.id !== 1 }
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

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const filtrosFinal = query.filter.join(";");

                const [response, permission] = await Promise.all([
                    getProductGroup(query.page, query.size, query.order, filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:pr01`)
                ]);

                setGrupoProductos(response.items);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
                setPermiso(permission.items[0]);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarTributaciones();
        recuperarMonedas();
    }, []);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteProductGroup(id);
        await AddAccess('Eliminar', id, userLog, "Grupos de Productos");
        recuperarGrupoProductos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const importarDatosERP = async () => {
        setLoading(true);
        setRowErp(null);
        await updateErpProductGroup();
        await AddAccess('Importar', 0, userLog, "Grupos de Productos");
        recuperarGrupoProductos();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const rowAGuardar = { ...formData };

        if (rowAGuardar.id) {
            await updateProductGroup(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Grupos de Productos");
        } else {
            const nuevoGrupoProducto = await saveProductGroup(rowAGuardar);
            await AddAccess('Insertar', nuevoGrupoProducto.saved.id, userLog, "Grupos de Productos");
        }
        recuperarGrupoProductos();
        setLoading(false);
        setRowAGuardar(null);
    };

    const handleSubmit = (formData) => {
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    };

    const handleView = (row) => {
        setRowAVisualizar(row);
        AddAccess('Visualizar', row.id, userLog, "Grupos de Productos");
    };

    const handleEdit = (row) => {
        setRowAGuardar(row);
    };

    const handleDelete = async (row) => {
        const rel = await getCommercial('', '', '', `subgrupoproducto.grupoproducto.id:eq:${row.id}`);
        if (rel.items.length > 0) setRowNoEliminar(row);
        else setRowAEliminar(row);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowErp && (
                <ImportErp setErp={setRowErp} title={'grupos de productos'} fun={importarDatosERP} />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'grupo de producto'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowNoEliminar && (
                <NotDelete setNoEliminar={setRowNoEliminar} title={'grupo de producto'} gen={true} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Grupo de Producto"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Grupo de Producto"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'GRUPOS DE PRODUCTOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={grupoproductos}
                userLog={userLog}
                query={query}
                setQuery={setQuery}
                totalPages={totalPages}
                totalItems={totalItems}
                onAdd={() => setRowAGuardar(selected)}
                onRefresh={refrescar}
                onErpImport={() => setRowErp(true)}
                canAdd={permiso?.puedeagregar}
                canImport={permiso?.puedeimportar}
                showErpButton={true}
                showAddButton={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                canEdit={permiso?.puedeeditar}
                canDelete={permiso?.puedeeliminar}
                canView={permiso?.puedever}
                columnSettings={columnSettings}
            />
        </>
    );
};
