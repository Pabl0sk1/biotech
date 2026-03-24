import { useState, useEffect } from 'react';
import { getCommercial, saveCommercial, updateCommercial, deleteCommercial, updateErpCommercial } from '../services/nombrecomercial.service.js';
import { getMeasure } from '../services/medida.service.js';
import { getProductGroup } from '../services/grupoproducto.service.js';
import { getProduct } from '../services/producto.service.js';
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

export const NombreComercialApp = ({ userLog, setUserLog }) => {

    const [nombrecomerciales, setNombreComerciales] = useState([]);
    const [medidas, setMedidas] = useState([]);
    const [subgrupos, setSubgrupos] = useState([]);
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
        subgrupoproducto: null,
        medida: null,
        nombrecomercial: "",
        erpid: 0
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        nombrecomercial: { label: "Descripción", order: 1, notnull: true, size: 150 },
        medida: {
            type: "object",
            options: medidas,
            searches: ['medida'],
            getLabel: (item) => item?.medida || "",
            module: ['pr02'],
            listPath: "/home/config/product/measures",
            popupTitle: "Medidas"
        },
        subgrupoproducto: {
            type: "object",
            options: subgrupos,
            searches: ['subgrupoproducto'],
            label: "Subgrupo de Producto",
            getLabel: (item) => item?.subgrupoproducto || "",
            module: ['pr01'],
            listPath: "/home/config/product/productgroups",
            popupTitle: "Grupos de Productos"
        },
        erpid: { label: "ERPID", type: "number", hidden: userLog?.id !== 1 }
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        nombrecomercial: { label: "Descripción", type: "string", classname: "text-start", default: true },
        medida: { label: "Medida", type: "string", field: "medida.medida", classname: "text-start" },
        subgrupoproducto: { label: "Subgrupo de Producto", type: "string", field: "subgrupoproducto.subgrupoproducto", classname: "text-start", default: true },
        erpid: { label: "ERPID", type: "number", classname: "text-end", hidden: userLog?.id !== 1 }
    };

    const recuperarNombreComerciales = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarSubgrupos = async () => {
        const response = await getProductGroup('', '', '', '', 'subgroups');
        setSubgrupos(response.items);
    }

    const recuperarMedidas = async () => {
        const response = await getMeasure();
        setMedidas(response.items);
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const filtrosFinal = query.filter.join(";");

                const [response, permission] = await Promise.all([
                    getCommercial(query.page, query.size, query.order, filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:cm02`)
                ]);

                setNombreComerciales(response.items);
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
        recuperarSubgrupos();
        recuperarMedidas();
    }, []);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteCommercial(id);
        await AddAccess('Eliminar', id, userLog, "Nombres Comerciales");
        recuperarNombreComerciales();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const importarDatosERP = async () => {
        setLoading(true);
        setRowErp(null);
        await updateErpCommercial();
        await AddAccess('Importar', 0, userLog, "Nombres Comerciales");
        recuperarNombreComerciales();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const rowAGuardar = { ...formData };

        if (rowAGuardar.id) {
            await updateCommercial(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Nombres Comerciales");
        } else {
            const nuevoNombreComercial = await saveCommercial(rowAGuardar);
            await AddAccess('Insertar', nuevoNombreComercial.saved.id, userLog, "Nombres Comerciales");
        }
        recuperarNombreComerciales();
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
        AddAccess('Visualizar', row.id, userLog, "Nombres Comerciales");
    };

    const handleEdit = (row) => {
        setRowAGuardar(row);
    };

    const handleDelete = async (row) => {
        const rel = await getProduct('', '', '', `nombrecomercial.id:eq:${row.id}`);
        if (rel.items.length > 0) setRowNoEliminar(row);
        else setRowAEliminar(row);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowErp && (
                <ImportErp setErp={setRowErp} title={'nombres comerciales'} fun={importarDatosERP} />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'nombre comercial'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowNoEliminar && (
                <NotDelete setNoEliminar={setRowNoEliminar} title={'nombre comercial'} gen={true} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Nombre Comercial"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Nombre Comercial"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'NOMBRES COMERCIALES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={nombrecomerciales}
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
