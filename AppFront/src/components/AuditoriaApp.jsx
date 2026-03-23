import { useState, useEffect } from 'react';
import { getAccess, deleteAccess } from '../services/auditoria.service.js';
import { getPermission } from '../services/permiso.service.js';
import Header from '../Header';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';

export const AuditoriaApp = ({ userLog, setUserLog }) => {

    const [auditorias, setAuditorias] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
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
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        usuario: {
            type: "object",
            getLabel: (item) => item?.nombreusuario || "",
        },
        fecha: { hidden: true },
        fechahora: { type: "datetime-local", label: "Fecha y Hora" },
        programa: { size: 20 },
        operacion: { size: 20 },
        codregistro: { type: "number", label: "Cód. Registro" },
        ip: { label: "IP", size: 20 },
        equipo: { size: 30 }
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        usuario: { label: "Usuario", type: "string", field: "usuario.nombreusuario", classname: "text-start", default: true },
        fecha: { label: "Fecha", type: "date", default: true },
        fechahora: { label: "Fecha y hora", type: "datetime-local" },
        programa: { label: "Programa", type: "string", default: true },
        operacion: { label: "Operación", type: "string", default: true },
        codregistro: { label: "Cód. Registro", type: "number", default: true },
        ip: { label: "IP", type: "string" },
        equipo: { label: "Equipo", type: "string" }
    };

    const recuperarAuditorias = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc01`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getAccess(query.page, query.size, query.order, filtrosFinal);
            setAuditorias(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteAccess(id);
        recuperarAuditorias();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    }

    const handleView = async (row) => {
        setRowAVisualizar(row);
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
                <Delete setEliminar={setRowAEliminar} title={'acceso'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Acceso"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'ACCESOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={auditorias}
                userLog={userLog}
                query={query}
                setQuery={setQuery}
                totalPages={totalPages}
                totalItems={totalItems}
                onAdd={() => null}
                onRefresh={refrescar}
                onErpImport={() => null}
                canAdd={permiso?.puedeagregar}
                canImport={permiso?.puedeimportar}
                showErpButton={false}
                showAddButton={false}
                onEdit={null}
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
