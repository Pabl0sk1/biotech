import { useState, useEffect } from 'react';
import { getEntity, saveEntity, updateEntity, deleteEntity, updateErpEntity } from '../services/entidad.service.js';
import { getPosition } from '../services/cargo.service.js';
import { getBranch } from '../services/sucursal.service.js';
import { getWallet } from '../services/cartera.service.js';
import { getEntityType } from '../services/tipoentidad.service.js';
import { getProduct } from '../services/producto.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { obtenerClaseEstadoReg } from '../utils/StatusBadge.js';
import { TruncDots } from '../utils/TruncDots.js';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import SmartTable from '../ModernTable.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const EntidadApp = ({ userLog }) => {

    const [entidades, setEntidades] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [carteras, setCarteras] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [entidadAGuardar, setEntidadAGuardar] = useState(null);
    const [entidadAEliminar, setEntidadAEliminar] = useState(null);
    const [entidadNoEliminar, setEntidadNoEliminar] = useState(null);
    const [entidadAVisualizar, setEntidadAVisualizar] = useState(null);
    const [entidadErp, setEntidadErp] = useState(null);
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
                setEntidadAEliminar(null);
                setEntidadNoEliminar(null);
                setEntidadAVisualizar(null);
                setEntidadAGuardar(null);
                setEntidadErp(null);
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
        id: { hidden: true },
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
        nomape: { hidden: true },
        nombre: { notnull: true },
        nrodoc: { label: "Nro. de documento" },
        nrotelefono: { type: "tel", label: "Nro. de teléfono" },
        correo: { type: "email" },
        fechanacimiento: { type: "date", label: "Fecha de nacimiento" },
        fechainicio: { type: "date", label: "Fecha de inicio" },
        fechafin: { type: "date", label: "Fecha de fin" },
        salario: { type: "number" },
        codzktime: { type: "number", label: "Código ZKTime" },
        estado: { type: "select", options: ["Activo", "Inactivo"], notnull: true },
        activo: { hidden: true },
        horaextra: { type: "checkbox", label: "¿Realiza horas extras?" },
        erpid: { hidden: userLog?.id !== 1, type: "number", label: "ERPID" }
    };
    const columnSettings = {
        id: { label: "#", type: "number" },
        nomape: {
            label: "Nombre/Apellido",
            type: "string",
            classname: "text-start",
            render: (row) => <span>{TruncDots(row.nomape, 35)}</span>,
            sortable: false
        },
        sucursal: { label: "Sucursal", type: "string", field: "sucursal.sucursal", classname: "text-start" },
        nrodoc: { label: "Nro. de documento", type: "string", classname: "text-end" },
        categorias: { label: "Categorías", type: "string" },
        estado: {
            label: "Estado",
            type: "string",
            render: (row) => (
                <p className={`status-badge ${obtenerClaseEstadoReg(row.activo)}`}>
                    {row.estado}
                </p>
            )
        }
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

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:ca01`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getEntity(query.page, query.size, query.order, filtrosFinal);
            setEntidades(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarCargos();
        recuperarSucursales();
        recuperarCarteras();
        recuperarCategorias();
    }, []);

    const eliminarEntidadFn = async (id) => {
        setLoading(true);
        await deleteEntity(id);
        await AddAccess('Eliminar', id, userLog, "Entidades");
        recuperarEntidades();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarEntidadFn(id);
        setEntidadAEliminar(null);
    }

    const importarDatosERP = async () => {
        setLoading(true);
        setEntidadErp(null);
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
        setEntidadAGuardar(null);
    };

    const handleSubmit = (formData) => {
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
    };

    const handleViewEntidad = async (entidad) => {
        await AddAccess('Visualizar', entidad.id, userLog, "Entidades");
        setEntidadAVisualizar(entidad);
    };

    const handleEditEntidad = (entidad) => {
        setEntidadAGuardar(entidad);
    };

    const handleDeleteEntidad = async (entidad) => {
        const rel = await getWallet('', '', '', `entidadid:eq:${entidad.id}`);
        const rel2 = await getProduct('', '', '', `entidad.id:eq:${entidad.id}`);
        if (rel.items.length > 0 || rel2.items.length > 0) {
            setEntidadNoEliminar(entidad);
        } else {
            setEntidadAEliminar(entidad);
        }
    };

    return (
        <>
            {loading && <Loading />}
            {entidadErp && (
                <ImportErp setErp={setEntidadErp} title={'entidades'} fun={importarDatosERP} />
            )}
            {entidadAEliminar && (
                <Delete
                    setEliminar={setEntidadAEliminar}
                    title={'entidad'}
                    gen={false}
                    confirmar={confirmarEliminacion}
                    id={entidadAEliminar.id}
                />
            )}
            {entidadNoEliminar && (
                <NotDelete
                    setNoEliminar={setEntidadNoEliminar}
                    title={'entidad'}
                    gen={false}
                />
            )}
            {entidadAVisualizar && (
                <SmartModal
                    open={!!entidadAVisualizar}
                    onClose={() => setEntidadAVisualizar(null)}
                    title="Entidad"
                    data={entidadAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}
            {entidadAGuardar && (
                <SmartModal
                    open={!!entidadAGuardar}
                    onClose={() => setEntidadAGuardar(null)}
                    title="Entidad"
                    data={entidadAGuardar}
                    onSave={handleSubmit}
                    mode={entidadAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <Header userLog={userLog} title={'ENTIDADES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
            <SmartTable
                data={entidades}
                query={query}
                setQuery={setQuery}
                totalPages={totalPages}
                totalItems={totalItems}
                onAdd={() => setEntidadAGuardar(selected)}
                onRefresh={refrescar}
                onErpImport={() => setEntidadErp(true)}
                canAdd={permiso?.puedeagregar}
                canImport={permiso?.puedeimportar}
                showErpButton={true}
                showAddButton={true}
                onEdit={handleEditEntidad}
                onDelete={handleDeleteEntidad}
                onView={handleViewEntidad}
                canEdit={permiso?.puedeeditar}
                canDelete={permiso?.puedeeliminar}
                canView={permiso?.puedever}
                columnSettings={columnSettings}
            />
        </>
    );
};
