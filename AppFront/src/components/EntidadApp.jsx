import { useState, useEffect } from 'react';
import { getEntity, saveEntity, updateEntity, deleteEntity, updateErpEntity } from '../services/entidad.service.js';
import { getPosition } from '../services/cargo.service.js';
import { getBranch } from '../services/sucursal.service.js';
import { getWallet } from '../services/cartera.service.js';
import { getEntityType } from '../services/tipoentidad.service.js';
import { getProduct } from '../services/producto.service.js';
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

export const EntidadApp = ({ userLog, setUserLog }) => {

    const [entidades, setEntidades] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [carteras, setCarteras] = useState([]);
    const [categorias, setCategorias] = useState([]);
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
        cargo: null,
        sucursal: null,
        cartera: null,
        categorias: "",
        nomape: "",
        nombre: "",
        apellido: "",
        nrodoc: "",
        nrotelefono: "",
        correo: "",
        fechanacimiento: "",
        fechainicio: "",
        fechafin: "",
        salario: 0,
        codzktime: 0,
        estado: "Activo",
        activo: true,
        horaextra: false,
        erpid: 0
    };
    const fieldSettings = {
        id: { type: "number", disabledonlyedit: true, order: 0 },
        cargo: {
            type: "object",
            options: cargos,
            searches: ['cargo'],
            label: "Cargo",
            getLabel: (item) => item?.cargo || "",
            autofocus: true,
            module: ['rh01'],
            listPath: "/home/config/rrhh/positions",
            popupTitle: "Cargos"
        },
        sucursal: {
            type: "object",
            options: sucursales,
            searches: ['sucursal'],
            label: "Sucursal",
            getLabel: (item) => item?.sucursal || "",
            module: ['gr03'],
            listPath: "/home/config/general/branchs",
            popupTitle: "Sucursales"
        },
        cartera: {
            type: "object",
            options: carteras,
            searches: ['nombre'],
            label: "Cartera",
            getLabel: (item) => item?.nombre || "",
            module: ['cm01'],
            listPath: "/home/config/commercial/wallets",
            popupTitle: "Carteras"
        },
        categorias: {
            type: "object.multiple",
            options: categorias,
            searches: ['tipoentidad'],
            label: "Categorías",
            getLabel: (item) => item?.tipoentidad || "",
            notnull: true,
            idfield: 'tipoentidad',
            module: ['gr06'],
            listPath: "/home/config/general/categories",
            popupTitle: "Categorías"
        },
        nomape: { size: 150, hidden: true },
        nombre: { size: 150, notnull: true },
        apellido: { size: 150 },
        nrodoc: { label: "Nro. de documento", size: 30 },
        nrotelefono: { type: "tel", label: "Nro. de teléfono", size: 30 },
        correo: { type: "email", size: 30 },
        fechanacimiento: { type: "date", label: "Fecha de nacimiento" },
        fechainicio: { type: "date", label: "Fecha de inicio" },
        fechafin: { type: "date", label: "Fecha de fin" },
        salario: { type: "number" },
        codzktime: { type: "number", label: "Código ZKTime" },
        estado: { type: "select", options: ["Activo", "Inactivo"] },
        activo: { hidden: true },
        horaextra: { type: "checkbox", label: "¿Realiza horas extras?" },
        erpid: { hidden: userLog?.id !== 1, type: "number", label: "ERPID" }
    };
    const columnSettings = {
        id: { label: "#", type: "number", default: true },
        nomape: {
            label: "Nombre/Apellido",
            type: "string",
            classname: "text-start",
            default: true,
            render: {
                rentype: "truncate",
                renval1: "nomape",
                renval2: 35
            }
        },
        categorias: { label: "Categorías", type: "string", default: true },
        cargo: { label: "Cargo", type: "string", field: "cargo.cargo", classname: "text-start" },
        sucursal: { label: "Sucursal", type: "string", field: "sucursal.sucursal", classname: "text-start" },
        cartera: { label: "Cartera", type: "string", field: "cartera.nombre", classname: "text-start", default: true },
        nombre: { hidden: true },
        apellido: { hidden: true },
        nrodoc: { label: "Nro. de documento", type: "string", classname: "text-end" },
        nrotelefono: { label: "Nro. de teléfono", type: "string", classname: "text-end", default: true },
        correo: { label: "Correo", type: "string", classname: "text-start", default: true },
        fechanacimiento: { label: "Fecha de nacimiento", type: "date" },
        fechainicio: { label: "Fecha de inicio", type: "date" },
        fechafin: { label: "Fecha de fin", type: "date" },
        salario: { label: "Salario", type: "number", classname: "text-end" },
        codzktime: { label: "Código ZKTime", type: "number", classname: "text-end" },
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
        horaextra: {
            label: "¿Realiza horas extras?",
            type: "boolean"
        },
        erpid: { label: "ERPID", type: "number", classname: "text-end", hidden: userLog?.id !== 1 }
    };

    const recuperarEntidades = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarCargos = async () => {
        const response = await getPosition();
        setCargos(response.items);
    }

    const recuperarSucursales = async () => {
        const response = await getBranch();
        setSucursales(response.items);
    }

    const recuperarCarteras = async () => {
        const response = await getWallet();
        setCarteras(response.items);
    }

    const recuperarCategorias = async () => {
        const response = await getEntityType();
        setCategorias(response.items);
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const filtrosFinal = query.filter.join(";");

                const [response, permission] = await Promise.all([
                    getEntity(query.page, query.size, query.order, filtrosFinal),
                    getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:ca01`)
                ]);

                setEntidades(response.items);
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
        recuperarCargos();
        recuperarSucursales();
        recuperarCarteras();
        recuperarCategorias();
    }, []);

    const eliminarFn = async (id) => {
        setLoading(true);
        await deleteEntity(id);
        await AddAccess('Eliminar', id, userLog, "Entidades");
        recuperarEntidades();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarFn(id);
        setRowAEliminar(null);
    }

    const importarDatosERP = async () => {
        setLoading(true);
        setRowErp(null);
        await updateErpEntity();
        await AddAccess('Importar', 0, userLog, "Entidades");
        recuperarEntidades();
        setLoading(false);
    }

    const guardarFn = async (formData) => {
        setLoading(true);

        let activo = true;
        if (formData.estado == 'Inactivo') activo = false;

        let apellido = "";
        if (formData.apellido) apellido = ", " + formData.apellido;

        const entidadActualizado = {
            ...formData,
            nomape: formData.nombre + apellido,
            activo: activo
        };

        if (entidadActualizado.id) {
            await updateEntity(entidadActualizado.id, entidadActualizado);
            await AddAccess('Modificar', entidadActualizado.id, userLog, "Entidades");
        } else {
            const nuevoEntidad = await saveEntity(entidadActualizado);
            await AddAccess('Insertar', nuevoEntidad.saved.id, userLog, "Entidades");
        }
        recuperarEntidades();
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
        await AddAccess('Visualizar', row.id, userLog, "Entidades");
        setRowAVisualizar(row);
    };

    const handleEdit = (row) => {
        setRowAGuardar(row);
    };

    const handleDelete = async (row) => {
        const rel = await getWallet('', '', '', `entidadid:eq:${row.id}`);
        const rel2 = await getProduct('', '', '', `entidad.id:eq:${row.id}`);
        if (rel.items.length > 0 || rel2.items.length > 0) {
            setRowNoEliminar(row);
        } else {
            setRowAEliminar(row);
        }
    };

    return (
        <>
            {loading && (
                <Loading />
            )}
            {rowErp && (
                <ImportErp setErp={setRowErp} title={'entidades'} fun={importarDatosERP} />
            )}
            {rowAEliminar && (
                <Delete setEliminar={setRowAEliminar} title={'entidad'} gen={false} confirmar={confirmarEliminacion} id={rowAEliminar.id} />
            )}
            {rowNoEliminar && (
                <NotDelete setNoEliminar={setRowNoEliminar} title={'entidad'} gen={false} />
            )}
            {rowAVisualizar && (
                <SmartModal
                    open={!!rowAVisualizar}
                    onClose={() => setRowAVisualizar(null)}
                    title="Entidad"
                    data={rowAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {rowAGuardar && (
                <SmartModal
                    open={!!rowAGuardar}
                    onClose={() => setRowAGuardar(null)}
                    title="Entidad"
                    data={rowAGuardar}
                    onSave={handleSubmit}
                    mode={rowAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'ENTIDADES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <SmartTable
                data={entidades}
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
