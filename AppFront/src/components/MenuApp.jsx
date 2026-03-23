import { useState, useEffect } from 'react';
import { getMenu, saveMenu, updateMenu, deleteMenu } from '../services/menu.service.js';
import { getModule } from '../services/modulo.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';

export const MenuApp = ({ userLog, setUserLog }) => {

    const [menus, setMenus] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rowAGuardar, setRowAGuardar] = useState(null);
    const [rowAEliminar, setRowAEliminar] = useState(null);
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
        menu: "",
        icono: "",
        orden: 1,
        recursos: "",
        unico: false,
        activo: true,
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        menu: { label: "Descripción", notnull: true, order: 1, autofocus: true, size: 50 },
        orden: { type: "number", order: 4 },
        icono: { order: 3, size: 30 },
        recursos: {
            type: "object.multiple",
            options: modulos,
            searches: ['moduloes', 'var'],
            getLabel: (item) => item?.moduloes || "",
            idfield: 'var',
            module: ['sc02'],
            listPath: "/home/security/modules",
            popupTitle: "Módulos",
            order: 2
        },
        unico: { label: "¿Es menú único?", type: "checkbox" },
        activo: { label: "¿Está activo?", type: "checkbox" },
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        menu: { label: "Descripción", type: "string", classname: "text-start", default: true },
        orden: { label: "Orden", type: "number" },
        icono: { label: "Icono", type: "string", classname: "text-start" },
        recursos: { label: "Recursos", type: "string" },
        unico: { label: "¿Es menú único?", type: "boolean" },
        activo: { label: "¿Está activo?", type: "boolean", default: true }
    };

    const recuperarMenus = () => {
        setQuery(q => ({ ...q }));
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
                    getMenu(query.page, query.size, query.order, filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc07`)
                ]);

                setMenus(response.items);
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
    }, []);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteMenu(id);
        await AddAccess('Eliminar', id, userLog, "Menús");
        recuperarMenus();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const rowAGuardar = {
            ...formData,
            recursos: formData?.recursos.toLowerCase() || ""
        };

        if (rowAGuardar.id) {
            await updateMenu(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Menús");
        } else {
            const nuevoMenu = await saveMenu(rowAGuardar);
            await AddAccess('Insertar', nuevoMenu.saved.id, userLog, "Menús");
        }
        recuperarMenus();
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
        await AddAccess('Visualizar', row.id, userLog, "Menús");
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
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'menu'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Menú"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Menú"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'MENÚS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={menus}
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
