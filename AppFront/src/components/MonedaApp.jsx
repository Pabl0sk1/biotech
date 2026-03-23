import { useState, useEffect } from 'react';
import { getCurrency, saveCurrency, updateCurrency, deleteCurrency, updateErpCurrency } from '../services/moneda.service.js';
import { getProductGroup } from '../services/grupoproducto.service.js';
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

export const MonedaApp = ({ userLog, setUserLog }) => {

    const [monedas, setMonedas] = useState([]);
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
        moneda: "",
        simbolo: "",
        codiso: "",
        erpid: 0
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        moneda: { label: "Descripción", notnull: true, autofocus: true, size: 50 },
        simbolo: { label: "Símbolo", size: 20 },
        codiso: { label: "Código ISO", size: 20 },
        erpid: { label: "ERPID", type: "number", hidden: userLog?.id !== 1 }
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        moneda: { label: "Descripción", type: "string", classname: "text-start", default: true },
        simbolo: { label: "Símbolo", type: "string", default: true },
        codiso: { label: "Código ISO", type: "string" },
        erpid: { label: "ERPID", type: "number", classname: "text-end", hidden: userLog?.id !== 1 }
    };

    const recuperarMonedas = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:gr02`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getCurrency(query.page, query.size, query.order, filtrosFinal);
            setMonedas(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteCurrency(id);
        await AddAccess('Eliminar', id, userLog, "Monedas");
        recuperarMonedas();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const importarDatosERP = async () => {
        setLoading(true);
        setRowErp(null);
        await updateErpCurrency();
        await AddAccess('Importar', 0, userLog, "Monedas");
        recuperarMonedas();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        const rowAGuardar = { ...formData };

        if (rowAGuardar.id) {
            await updateCurrency(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Monedas");
        } else {
            const nuevoMoneda = await saveCurrency(rowAGuardar);
            await AddAccess('Insertar', nuevoMoneda.saved.id, userLog, "Monedas");
        }
        recuperarMonedas();
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
        await AddAccess('Visualizar', row.id, userLog, "Monedas");
        setRowAVisualizar(row);
    };

    const handleEdit = (row) => {
        setRowAGuardar(row);
    };

    const handleDelete = async (row) => {
        const rel = await getProductGroup('', '', '', `moneda.id:eq:${row?.id}`);
        if (rel.items.length > 0) setRowNoEliminar(row);
        else setRowAEliminar(row);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowErp && (
                <ImportErp setErp={setRowErp} title={'monedas'} fun={importarDatosERP} />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'moneda'} gen={false} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowNoEliminar && (
                <NotDelete setNoEliminar={setRowNoEliminar} title={'moneda'} gen={false} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Moneda"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Moneda"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'MONEDAS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={monedas}
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
