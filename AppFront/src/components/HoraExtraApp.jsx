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
    const [horaextraAGuardar, setHoraExtraAGuardar] = useState(null);
    const [horaextraAEliminar, setHoraExtraAEliminar] = useState(null);
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
                setHoraExtraAEliminar(null);
                setHoraExtraAGuardar(null);
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

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:rh04`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getReport(query.page, query.size, query.order, 'tipoinforme.id:eq:1;' + filtrosFinal);
            setHorasExtras(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
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

    const eliminarHoraExtraFn = async (id) => {
        setLoading(true);
        await deleteReportData(id);
        await deleteReport(id);
        await AddAccess('Eliminar', id, userLog, "Horas Extras");
        recuperarHorasExtras();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarHoraExtraFn(id);
        setHoraExtraAEliminar(null);
    }

    const guardarFn = async (datos, modoEdicion) => {
        setHoraExtraAGuardar(null);
        if (datos?.id) navigate(`/home/main/rrhh/calcext/${datos.id}`, {
            state: { userLog, datos, modoEdicion }
        });
        else navigate(`/home/main/rrhh/calcext/${selected.id}`, {
            state: { userLog, datos: selected, modoEdicion: true }
        });
        recuperarHorasExtras();
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    };

    const handleViewHoraExtra = async (horaextra) => {
        await AddAccess('Visualizar', horaextra.id, userLog, "Horas Extras");
        guardarFn(horaextra);
    };

    const handleEditHoraExtra = (horaextra) => {
        guardarFn(horaextra, true);
    };

    const handleDeleteHoraExtra = (horaextra) => {
        setHoraExtraAEliminar(horaextra);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {horaextraAEliminar && (
                <Delete setEliminar={setHoraExtraAEliminar} title={'hora extra'} gen={false} confirmar={confirmarEliminacion} id={horaextraAEliminar.id} />
            )}
            {horaextraAGuardar && (
                <SaveModal setGuardar={setHoraExtraAGuardar} title={'hora extra'} gen={false} fun={guardarFn} />
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
                onAdd={() => setHoraExtraAGuardar(selected)}
                onRefresh={refrescar}
                onErpImport={() => null}
                canAdd={permiso?.puedeagregar}
                canImport={null}
                showErpButton={false}
                showAddButton={true}
                onEdit={handleEditHoraExtra}
                onDelete={handleDeleteHoraExtra}
                onView={handleViewHoraExtra}
                canEdit={permiso?.puedeeditar}
                canDelete={permiso?.puedeeliminar}
                canView={permiso?.puedever}
                columnSettings={columnSettings}
            />
        </>
    );
};
