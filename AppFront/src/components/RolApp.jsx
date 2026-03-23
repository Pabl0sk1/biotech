import { useEffect, useState } from "react";
import { getRole, saveRole, updateRole, deleteRole } from '../services/tipousuario.service.js';
import { getUser } from "../services/usuario.service.js";
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';

export const RolApp = ({ userLog, setUserLog }) => {

    const [roles, setRoles] = useState([]);
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
        tipousuario: ""
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        tipousuario: { label: "Descripción", notnull: true, autofocus: true, size: 150 }
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        tipousuario: { label: "Descripción", type: "string", classname: "text-start", default: true }
    };

    const recuperarRoles = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc03`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getRole(query.page, query.size, query.order, filtrosFinal);
            setRoles(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteRole(id);
        await AddAccess('Eliminar', id, userLog, "Roles");
        recuperarRoles();
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
            await updateRole(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Roles");
        } else {
            const nuevoRol = await saveRole(rowAGuardar);
            await AddAccess('Insertar', nuevoRol.saved.id, userLog, "Roles");
        }
        recuperarRoles();
        setLoading(false);
        setRowAGuardar(null);
    };

    const handleSubmit = (formData) => {
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    }

    const handleView = async (row) => {
        await AddAccess('Visualizar', row.id, userLog, "Roles");
        setRowAVisualizar(row);
    };

    const handleEdit = (row) => {
        setRowAGuardar(row);
    };

    const handleDelete = async (rol) => {
        const rel = await getUser('', '', '', `tipousuario.id:eq:${rol?.id}`);
        const rel2 = await getPermission('', '', '', `tipousuario.id:eq:${rol?.id}`);
        if (rel.items.length > 0 || rel2.items.length > 0) {
            setRowNoEliminar(rol);
        } else {
            setRowAEliminar(rol);
        }
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'rol'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowNoEliminar && (
                <NotDelete setNoEliminar={setRowNoEliminar} title={'rol'} gen={true} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Rol"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    columns={1}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Rol"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    columns={1}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'ROLES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={roles}
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
