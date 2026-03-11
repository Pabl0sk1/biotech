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

export const PlaneamientoApp = ({ userLog, setUserLog }) => {

    const navigate = useNavigate();
    const [planeamientos, setPlaneamientos] = useState([]);
    const [tipo, setTipo] = useState({});
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [planeamientoAGuardar, setPlaneamientoAGuardar] = useState(null);
    const [planeamientoAEliminar, setPlaneamientoAEliminar] = useState(null);
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
                setPlaneamientoAEliminar(null);
                setPlaneamientoAGuardar(null);
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

    const recuperarPlaneamientos = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:cm03`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getReport(query.page, query.size, query.order, 'tipoinforme.id:eq:2;' + filtrosFinal);
            setPlaneamientos(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        const cargarTipo = async () => {
            const tp = await getReportType('', '', '', 'id:eq:2');
            setTipo(tp.items[0]);
        }
        cargarTipo();
    }, []);

    const eliminarPlaneamientoFn = async (id) => {
        setLoading(true);
        await deleteReportData(id);
        await deleteReport(id);
        await AddAccess('Eliminar', id, userLog, "Planeamientos");
        recuperarPlaneamientos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarPlaneamientoFn(id);
        setPlaneamientoAEliminar(null);
    }

    const guardarFn = async (datos, modoEdicion) => {
        setPlaneamientoAGuardar(null);
        if (datos?.id) navigate(`/home/main/commercial/planning/${datos.id}`, {
            state: { userLog, datos, modoEdicion }
        });
        else navigate(`/home/main/commercial/planning/${selected.id}`, {
            state: { userLog, datos: selected, modoEdicion: true }
        });
        recuperarPlaneamientos();
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    };

    const handleViewPlaneamiento = async (planeamiento) => {
        await AddAccess('Visualizar', planeamiento.id, userLog, "Planeamientos");
        guardarFn(planeamiento);
    };

    const handleEditPlaneamiento = (planeamiento) => {
        guardarFn(planeamiento, true);
    };

    const handleDeletePlaneamiento = (planeamiento) => {
        setPlaneamientoAEliminar(planeamiento);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {planeamientoAEliminar && (
                <Delete setEliminar={setPlaneamientoAEliminar} title={'planeamiento'} gen={true} confirmar={confirmarEliminacion} id={planeamientoAEliminar.id} />
            )}
            {planeamientoAGuardar && (
                <SaveModal setGuardar={setPlaneamientoAGuardar} title={'planeamiento'} gen={true} fun={guardarFn} />
            )}

            <Header userLog={userLog} title={'PLANEAMIENTOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={planeamientos}
                customReg={'report'}
                userLog={userLog}
                query={query}
                setQuery={setQuery}
                totalPages={totalPages}
                totalItems={totalItems}
                onAdd={() => setPlaneamientoAGuardar(selected)}
                onRefresh={refrescar}
                onErpImport={() => null}
                canAdd={permiso?.puedeagregar}
                canImport={null}
                showErpButton={false}
                showAddButton={true}
                onEdit={handleEditPlaneamiento}
                onDelete={handleDeletePlaneamiento}
                onView={handleViewPlaneamiento}
                canEdit={permiso?.puedeeditar}
                canDelete={permiso?.puedeeliminar}
                canView={permiso?.puedever}
                columnSettings={columnSettings}
            />
        </>
    );
};
