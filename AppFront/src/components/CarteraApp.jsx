import { useState, useEffect } from 'react';
import { getWallet, saveWallet, updateWallet, deleteWallet, updateErpWallet } from '../services/cartera.service.js';
import { getEntity } from '../services/entidad.service.js';
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

export const CarteraApp = ({ userLog, setUserLog }) => {

    const [carteras, setCarteras] = useState([]);
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
        entidadid: 0,
        nombre: "",
        region: "",
        erpid: 0
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        nombre: { label: "Descripción", notnull: true, order: 1, autofocus: true, size: 150 },
        region: { label: "Región", notnull: true, order: 2, size: 150 },
        entidadid: { type: "number", label: "Entidad ID" },
        erpid: { hidden: userLog?.id !== 1, type: "number", label: "ERPID" }
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        nombre: { label: "Descripción", type: "string", classname: "text-start", default: true },
        region: { label: "Región", type: "string", classname: "text-start" },
        entidadid: { label: "Entidad ID", type: "number", classname: "text-end" },
        erpid: { label: "ERPID", type: "number", classname: "text-end", hidden: userLog?.id !== 1 }
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

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteWallet(id);
        await AddAccess('Eliminar', id, userLog, "Carteras");
        recuperarCarteras();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const importarDatosERP = async () => {
        setLoading(true);
        setRowErp(null);
        await updateErpWallet();
        await AddAccess('Importar', 0, userLog, "Carteras");
        recuperarCarteras();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const rowAGuardar = { ...formData };

        if (rowAGuardar.id) {
            await updateWallet(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Carteras");
        } else {
            const nuevoCartera = await saveWallet(rowAGuardar);
            await AddAccess('Insertar', nuevoCartera.saved.id, userLog, "Carteras");
        }
        recuperarCarteras();
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
        await AddAccess('Visualizar', row.id, userLog, "Carteras");
        setRowAVisualizar(row);
    };

    const handleEdit = (row) => {
        setRowAGuardar(row);
    };

    const handleDelete = async (row) => {
        const rel = await getEntity('', '', '', `cartera.id:eq:${row?.id}`);
        if (rel.items.length > 0) setRowNoEliminar(row);
        else setRowAEliminar(row);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowErp && (
                <ImportErp setErp={setRowErp} title={'carteras'} fun={importarDatosERP} />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'cartera'} gen={false} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowNoEliminar && (
                <NotDelete setNoEliminar={setRowNoEliminar} title={'cartera'} gen={false} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Cartera"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Cartera"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'CARTERAS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={carteras}
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
