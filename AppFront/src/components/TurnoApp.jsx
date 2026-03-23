import { useState, useEffect } from 'react';
import { getShift, saveShift, updateShift, deleteShift } from '../services/turno.service.js';
import { getSchedule } from '../services/tipoturno.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Sidebar from '../Sidebar.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';

export const TurnoApp = ({ userLog, setUserLog }) => {

    const [turnos, setTurnos] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rowAGuardar, setRowAGuardar] = useState(null);
    const [rowAEliminar, setRowAEliminar] = useState(null);
    const [rowAVisualizar, setRowAVisualizar] = useState(null);
    const [detalleNoEliminar, setDetalleNoEliminar] = useState(false);
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
                if (detalleNoEliminar) {
                    setDetalleNoEliminar(false);
                } else {
                    setRowAEliminar(null);
                    setRowAVisualizar(null);
                    setRowAGuardar(null);
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [detalleNoEliminar]);

    const selected = {
        id: null,
        tipoturno: null,
        descripcion: "",
        horaent: "00:00",
        horasal: "00:00",
        horades: "00:00",
        thoras: 0,
        extporcen: 0
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        tipoturno: {
            type: "object",
            options: modalidades,
            searches: ['tipo'],
            label: "Modalidad",
            getLabel: (item) => item?.tipo || "",
            autofocus: true,
            module: ['rh02'],
            listPath: '/home/config/rrhh/schedules',
            popupTitle: 'Modalidades',
            notnull: true
        },
        descripcion: { label: "Descripción", notnull: true, size: 150 },
        horaent: { type: "time", label: "Horarío de entrada" },
        horasal: { type: "time", label: "Horarío de salida" },
        horades: { type: "time", label: "Tiempo de descanso" },
        thoras: { type: "number", label: "Total de horas semanales" },
        extporcen: { type: "number", label: "Porcentaje" },
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        descripcion: { label: "Descripción", type: "string", classname: "text-start", default: true },
        tipoturno: { label: "Modalidad", type: "string", field: "tipoturno.tipo", classname: "text-start", default: true },
        horaent: { label: "Horarío de entrada", type: "time", default: true },
        horasal: { label: "Horarío de salida", type: "time", default: true },
        horades: { label: "Tiempo de descanso", type: "time" },
        thoras: { label: "Total de horas semanales", type: "number" },
        extporcen: { label: "Porcentaje", type: "number" }
    };

    const recuperarTurnos = () => {
        setQuery(q => ({ ...q }));
    }

    const recuperarModalidades = async () => {
        const response = await getSchedule();
        setModalidades(response.items);
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const filtrosFinal = query.filter.join(";");

                const [response, permission] = await Promise.all([
                    getShift(query.page, query.size, query.order, filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:rh03`)
                ]);

                setTurnos(response.items);
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
        recuperarModalidades();
    }, []);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteShift(id);
        await AddAccess('Eliminar', id, userLog, "Turnos");
        recuperarTurnos();
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
            await updateShift(rowAGuardar.id, rowAGuardar);
            await AddAccess('Modificar', rowAGuardar.id, userLog, "Turnos");
        } else {
            const nuevaTurno = await saveShift(rowAGuardar);
            await AddAccess('Insertar', nuevaTurno.saved.id, userLog, "Turnos");
        }
        recuperarTurnos();
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
        await AddAccess('Visualizar', row.id, userLog, "Turnos");
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
                <Delete setEliminar={setRowAEliminar} title={'turno'} gen={true} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Turno"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Turno"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'TURNOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={turnos}
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
