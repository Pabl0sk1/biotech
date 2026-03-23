import { useState, useEffect } from 'react';
import { getPermission, savePermission, updatePermission, deletePermission } from '../services/permiso.service.js';
import { getRole } from '../services/tipousuario.service.js';
import { getModule } from '../services/modulo.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';
import Duplicate from '../layouts/Duplicate.jsx';

export const PermisoApp = ({ userLog, setUserLog }) => {

    const [permisos, setPermisos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rowAGuardar, setRowAGuardar] = useState(null);
    const [rowAEliminar, setRowAEliminar] = useState(null);
    const [rowAVisualizar, setRowAVisualizar] = useState(null);
    const [rowDuplicado, setRowDuplicado] = useState(null);
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
                if (rowDuplicado) {
                    setRowDuplicado(null);
                    return;
                }
                setRowAGuardar(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [rowDuplicado]);

    const selected = {
        id: null,
        tipousuario: null,
        modulo: null,
        puedeconsultar: false,
        puedever: false,
        puedeagregar: false,
        puedeeliminar: false,
        puedeeditar: false,
        puedeimportar: false
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        tipousuario: {
            type: "object",
            options: roles,
            searches: ['tipousuario'],
            label: "Rol",
            getLabel: (item) => item?.tipousuario || "",
            autofocus: true,
            module: ['sc03'],
            listPath: "/home/security/roles",
            popupTitle: "Roles",
            notnull: true
        },
        modulo: {
            type: "object",
            options: modulos,
            searches: ['moduloes', 'var'],
            label: "Módulo",
            getLabel: (item) => item?.moduloes || "",
            module: ['sc02'],
            listPath: "/home/security/modules",
            popupTitle: "Módulos",
            notnull: true
        },
        puedeconsultar: { type: "checkbox", label: "¿Puede consultar?" },
        puedever: { type: "checkbox", label: "¿Puede ver?" },
        puedeagregar: { type: "checkbox", label: "¿Puede agregar?" },
        puedeeliminar: { type: "checkbox", label: "¿Puede eliminar?" },
        puedeeditar: { type: "checkbox", label: "¿Puede editar?" },
        puedeimportar: { type: "checkbox", label: "¿Puede importar?" },
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        tipousuario: { label: "Rol", type: "string", field: "tipousuario.tipousuario", classname: "text-start", default: true },
        modulo: { label: "Módulo", type: "string", field: "modulo.moduloes", classname: "text-start", default: true },
        puedeconsultar: { label: "¿Puede consultar?", type: "boolean", default: true },
        puedever: { label: "¿Puede ver?", type: "boolean" },
        puedeagregar: { label: "¿Puede agregar?", type: "boolean" },
        puedeeliminar: { label: "¿Puede eliminar?", type: "boolean" },
        puedeeditar: { label: "¿Puede editar?", type: "boolean" },
        puedeimportar: { label: "¿Puede importar?", type: "boolean" }
    };

    const recuperarPermisos = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarRoles = async () => {
        const response = await getRole();
        setRoles(response.items);
    }

    const recuperarModulos = async () => {
        const response = await getModule();
        setModulos(response.items);
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const filtrosFinal = query.filter.join(";");

                const [response, permission] = await Promise.all([
                    getPermission(query.page, query.size, query.order, filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc05`)
                ]);

                setPermisos(response.items);
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
        recuperarModulos();
        recuperarRoles();
    }, []);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deletePermission(id);
        await AddAccess('Eliminar', id, userLog, "Permisos");
        recuperarPermisos();
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
            await updatePermission(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Permisos");
        } else {
            const nuevoPermiso = await savePermission(rowAGuardar);
            await AddAccess('Insertar', nuevoPermiso.saved.id, userLog, "Permisos");
        }
        recuperarPermisos();
        setLoading(false);
        setRowAGuardar(null);
    };

    const verificarPermisoDuplicado = (dato) => {
        return permisos.some(p => p.tipousuario.id == dato.tipousuario.id && p.modulo.id == dato.modulo.id && p.id !== dato.id);
    };

    const handleSubmit = (formData) => {
        if (verificarPermisoDuplicado(formData)) {
            setRowDuplicado(true);
            return;
        }
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    };

    const handleView = async (row) => {
        await AddAccess('Visualizar', row.id, userLog, "Permisos");
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
            {rowDuplicado && (
                <Duplicate setDuplicado={setRowDuplicado} title={'permiso'} gen={true} />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'permiso'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Permiso"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Permiso"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'PERMISOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={permisos}
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
};
