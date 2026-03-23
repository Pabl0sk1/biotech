import { useState, useEffect } from 'react';
import { getCommission, saveCommission, updateCommission, deleteCommission, updateErpCommission } from '../services/comision.service.js';
import { getEntity } from '../services/entidad.service.js';
import { getProductGroup } from '../services/grupoproducto.service.js';
import { getProduct } from '../services/producto.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const ComisionApp = ({ userLog, setUserLog }) => {

    const [comisiones, setComisiones] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [subgrupos, setSubgrupos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rowAGuardar, setRowAGuardar] = useState(null);
    const [rowAEliminar, setRowAEliminar] = useState(null);
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
        entidad: null,
        grupoproducto: null,
        subgrupoproducto: null,
        producto: null,
        basecalculo: "",
        porcentaje: 0,
        erpid: 0
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        entidad: {
            type: "object",
            notnull: true,
            options: entidades,
            searches: ['nomape', 'nrodoc'],
            label: "Entidad",
            getLabel: (item) => item?.nomape || "",
            autofocus: true,
            module: ['ca01'],
            listPath: "/home/cadastres/entities",
            popupTitle: "Entidades"
        },
        grupoproducto: {
            type: "object",
            options: grupos,
            searches: ['grupoproducto'],
            label: "Grupo de Producto",
            getLabel: (item) => item?.grupoproducto || "",
            module: ['pr01'],
            listPath: "/home/config/product/productgroups",
            popupTitle: "Grupos de Productos",
            disabledifvalues: ['subgrupoproducto', 'producto']
        },
        subgrupoproducto: {
            type: "object",
            options: subgrupos,
            searches: ['subgrupoproducto'],
            label: "Subgrupo de Producto",
            getLabel: (item) => item?.subgrupoproducto || "",
            module: ['pr01'],
            listPath: "/home/config/product/productgroups",
            popupTitle: "Grupos de Productos",
            disabledifvalues: ['producto', 'grupoproducto']
        },
        producto: {
            type: "object",
            options: productos,
            searches: ['nombrecomercial.nombrecomercial'],
            label: "Producto",
            getLabel: (item) => item?.nombrecomercial?.nombrecomercial || "",
            module: ['ca02'],
            listPath: "/home/cadastres/products",
            popupTitle: "Productos",
            disabledifvalues: ['grupoproducto', 'subgrupoproducto']
        },
        basecalculo: { type: "select", label: "Base de Cálculo", options: ["Precio", "Rentabilidad"] },
        porcentaje: { type: "number", notnull: true },
        erpid: { hidden: userLog?.id !== 1, type: "number", label: "ERPID" }
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        entidad: { label: "Entidad", type: "string", field: "entidad.nomape", classname: "text-start", default: true },
        grupoproducto: { label: "Grupo de Producto", type: "string", field: "grupoproducto.grupoproducto", classname: "text-start" },
        subgrupoproducto: { label: "Subgrupo de Producto", type: "string", field: "subgrupoproducto.subgrupoproducto", classname: "text-start" },
        producto: { label: "Producto", type: "string", field: "producto.nombrecomercial.nombrecomercial", classname: "text-start" },
        basecalculo: { label: "Base de Cálculo", type: "string", classname: "text-start", default: true },
        porcentaje: { label: "Porcentaje", type: "number" },
        erpid: { label: "ERPID", type: "number", classname: "text-end", hidden: userLog?.id !== 1 }
    };

    const recuperarComisiones = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarEntidades = async () => {
        const response = await getEntity();
        setEntidades(response.items);
    }

    const recuperarGrupos = async () => {
        const response = await getProductGroup();
        setGrupos(response.items);
    }

    const recuperarSubgrupos = async () => {
        const response = await getProductGroup('', '', '', '', 'subgroups');
        setSubgrupos(response.items);
    }

    const recuperarProductos = async () => {
        const response = await getProduct();
        setProductos(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:cm04`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getCommission(query.page, query.size, query.order, filtrosFinal);
            setComisiones(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarEntidades();
        recuperarGrupos();
        recuperarSubgrupos();
        recuperarProductos();
    }, []);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteCommission(id);
        await AddAccess('Eliminar', id, userLog, "Comisiones");
        recuperarComisiones();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const importarDatosERP = async () => {
        setLoading(true);
        setRowErp(null);
        await updateErpCommission();
        await AddAccess('Importar', 0, userLog, "Comisiones");
        recuperarComisiones();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const rowAGuardar = { ...formData };

        if (rowAGuardar.id) {
            await updateCommission(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Comisiones");
        } else {
            const nuevoComision = await saveCommission(rowAGuardar);
            await AddAccess('Insertar', nuevoComision.saved.id, userLog, "Comisiones");
        }
        recuperarComisiones();
        setLoading(false);
        setRowAGuardar(null);
    };

    const handleSubmit = (formData) => {
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    };

    const handleView = async (row) => {
        await AddAccess('Visualizar', row.id, userLog, "Comisiones");
        setRowAVisualizar(row);
    };

    const handleEdit = (row) => {
        setRowAGuardar(row);
    };

    const handleDelete = async (row) => {
        setRowAEliminar(row);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowErp && (
                <ImportErp setErp={setRowErp} title={'comisiones'} fun={importarDatosERP} />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'comision'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Comisión"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Comisión"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'COMISIONES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={comisiones}
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
