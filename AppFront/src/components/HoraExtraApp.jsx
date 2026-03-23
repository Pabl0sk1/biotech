import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReport, deleteReport, deleteReportData } from '../services/informe.service.js';
import { getReportType } from '../services/tipoinforme.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';
import SaveModal from '../layouts/SaveModal.jsx';

export const HoraExtraApp = ({ userLog, setUserLog }) => {

    const navigate = useNavigate();
    const [horasextras, setHorasExtras] = useState([]);
    const [tipo, setTipo] = useState({});
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rowAGuardar, setRowAGuardar] = useState(null);
    const [rowAEliminar, setRowAEliminar] = useState(null);
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

    const selected = {
        id: null,
        usuario: { ...userLog },
        tipoinforme: { ...tipo },
        descripcion: "",
        fechacreacion: new Date(),
        fechaactualizacion: new Date(),
        estado: "Borrador"
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        descripcion: { label: "Descripción", type: "string", classname: "text-start", default: true },
        fechacreacion: { label: "Fecha de creación", type: "date" },
        fechaactualizacion: { label: "Fecha de actualización", type: "date", default: true },
        estado: {
            label: "Estado",
            type: "string",
            default: true,
            render: {
                rentype: "statusinf",
                renval1: "estado"
            }
        },
    };

    const recuperarHorasExtras = () => {
        setQuery(q => ({ ...q }));
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const filtrosFinal = query.filter.join(";");

                const [response, permission] = await Promise.all([
                    getReport(query.page, query.size, query.order, 'tipoinforme.id:eq:1;' + filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:rh04`)
                ]);

                setHorasExtras(response.items);
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
        const cargarTipo = async () => {
            const tp = await getReportType('', '', '', 'id:eq:1');
            setTipo(tp.items[0]);
        }
        cargarTipo();
    }, []);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteReportData(id);
        await deleteReport(id);
        await AddAccess('Eliminar', id, userLog, "Horas Extras");
        recuperarHorasExtras();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const guardarFn = async (datos, modoEdicion) => {
        setRowAGuardar(null);
        if (datos?.id) navigate(`/home/main/rrhh/calcext/${datos.id}`, {
            state: { datos, modoEdicion }
        });
        else navigate(`/home/main/rrhh/calcext/${selected.id}`, {
            state: { datos: selected, modoEdicion: true }
        });
        recuperarHorasExtras();
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    };

    const handleView = async (row) => {
        await AddAccess('Visualizar', row.id, userLog, "Horas Extras");
        guardarFn(row);
    };

    const handleEdit = (row) => {
        guardarFn(row, true);
    };

    const handleDelete = (row) => {
        setRowAEliminar(row);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'hora extra'} gen={false} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowAGuardar && (
                <SaveModal setGuardar={setRowAGuardar} title={'hora extra'} gen={false} fun={guardarFn} />
            )}

            <Header userLog={userLog} title={'HORAS EXTRAS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={horasextras}
                customReg={'report'}
                userLog={userLog}
                query={query}
                setQuery={setQuery}
                totalPages={totalPages}
                totalItems={totalItems}
                onAdd={() => setRowAGuardar(selected)}
                onRefresh={refrescar}
                onErpImport={() => null}
                canAdd={permiso?.puedeagregar}
                canImport={null}
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
