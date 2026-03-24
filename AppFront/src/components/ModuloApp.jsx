import { useEffect, useState } from "react";
import { getModule, saveModule, updateModule, deleteModule } from '../services/modulo.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';

export const ModuloApp = ({ userLog, setUserLog }) => {

    const [modulos, setModulos] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rowAGuardar, setRowAGuardar] = useState(null);
    const [rowAEliminar, setRowAEliminar] = useState(null);
    const [rowNoEliminar, setRowNoEliminar] = useState(null);
    const [rowAVisualizar, setRowAVisualizar] = useState(null);
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
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selected = {
        id: null,
        moduloes: "",
        moduloen: "",
        var: ""
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        moduloes: { label: "Módulo Español", notnull: true, autofocus: true, size: 50 },
        moduloen: { label: "Módulo Inglés", notnull: true, size: 50 },
        var: { label: "Variable", notnull: true, size: 10 }
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        moduloes: { label: "Módulo Español", type: "string", classname: "text-start", default: true },
        moduloen: { label: "Módulo Inglés", type: "string", classname: "text-start" },
        var: { label: "Variable", type: "string", default: true }
    };

    const recuperarModulos = () => {
        setQuery(q => ({ ...q }));
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const filtrosFinal = query.filter.join(";");

                const [response, permission] = await Promise.all([
                    getModule(query.page, query.size, query.order, filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc02`)
                ]);

                setModulos(response.items);
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

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteModule(id);
        await AddAccess('Eliminar', id, userLog, "Módulos");
        recuperarModulos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const rowAGuardar = { ...formData };

        if (rowAGuardar.id) {
            await updateModule(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Módulos");
        } else {
            const nuevoModulo = await saveModule(rowAGuardar);
            await AddAccess('Insertar', nuevoModulo.saved.id, userLog, "Módulos");
        }
        recuperarModulos();
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
        AddAccess('Visualizar', row.id, userLog, "Módulos");
    };

    const handleEdit = (row) => {
        setRowAGuardar(row);
    };

    const handleDelete = async (row) => {
        const rel = await getPermission('', '', '', `modulo.id:eq:${row?.id}`);
        if (rel.items.length > 0) {
            setRowNoEliminar(row);
        } else {
            setRowAEliminar(row);
        }
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'modulo'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowNoEliminar && (
                <NotDelete setNoEliminar={setRowNoEliminar} title={'modulo'} gen={true} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Módulo"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Módulo"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'MÓDULOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={modulos}
                userLog={userLog}
                query={query}
                setQuery={setQuery}
                totalPages={totalPages}
                totalItems={totalItems}
                onAdd={() => setRowAGuardar(selected)}
                onRefresh={refrescar}
                onErpImport={() => null}
                canAdd={permiso?.puedeagregar}
                canImport={permiso?.puedeimportar}
                showErpButton={false}
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
}
