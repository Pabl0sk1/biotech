import { useEffect, useState } from "react";
import { getToken, saveToken, deleteToken } from '../services/token.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';
import SaveModal from "../layouts/SaveModal.jsx";
import Header from '../Header';

export const TokenApp = ({ userLog, setUserLog }) => {

    const [tokens, setTokens] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rowAEliminar, setRowAEliminar] = useState(null);
    const [rowAGuardar, setRowAGuardar] = useState(null);
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
                setRowAGuardar(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        usuario: { label: "Usuario", type: "string", field: "usuario.nombreusuario", classname: "text-start", default: true },
        token: {
            label: "Token",
            type: "string",
            default: true,
            render: {
                rentype: "token"
            },
            sortable: false,
            filtered: false
        },
        fechacreacion: { label: "Fecha de creación", type: "date", default: true },
        fechahoracreacion: { hidden: true },
        fechaexpiracion: { label: "Fecha de expiración", type: "date" },
        fechahoraexpiracion: { hidden: true },
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
    };

    const recuperarTokens = () => {
        setQuery(q => ({ ...q }));
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const filtrosFinal = query.filter.join(";");

                const [response, permission] = await Promise.all([
                    getToken(query.page, query.size, query.order, filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc04`)
                ]);

                setTokens(response.items);
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
        await deleteToken(id);
        await AddAccess('Eliminar', id, userLog, "Tokens");
        recuperarTokens();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const guardarFn = async () => {
        setLoading(true);

        const nuevoToken = await saveToken(userLog?.id);
        await AddAccess('Insertar', nuevoToken.saved.id, userLog, "Tokens");
        recuperarTokens();
        setLoading(false);
        setRowAGuardar(null);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    }

    const handleDelete = (row) => {
        setRowAEliminar(row);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'token'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowAGuardar && (
                <SaveModal setGuardar={setRowAGuardar} title={'token'} gen={true} fun={guardarFn} />
            )}

            <Header userLog={userLog} title={'TOKENS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={tokens}
                customReg={'token'}
                userLog={userLog}
                query={query}
                setQuery={setQuery}
                totalPages={totalPages}
                totalItems={totalItems}
                onAdd={() => setRowAGuardar(true)}
                onRefresh={refrescar}
                onErpImport={() => null}
                canAdd={permiso?.puedeagregar}
                canImport={permiso?.puedeimportar}
                showErpButton={false}
                showAddButton={true}
                onEdit={null}
                onDelete={handleDelete}
                onView={null}
                canEdit={permiso?.puedeeditar}
                canDelete={permiso?.puedeeliminar}
                canView={permiso?.puedever}
                columnSettings={columnSettings}
            />
        </>
    );
}
