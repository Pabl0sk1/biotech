import { useState, useEffect } from 'react';
import { getEntity, saveEntity, updateEntity, deleteEntity, updateErpEntity } from '../services/entidad.service.js';
import { getPosition } from '../services/cargo.service.js';
import { getBranch } from '../services/sucursal.service.js';
import { getWallet } from '../services/cartera.service.js';
import { getEntityType } from '../services/tipoentidad.service.js';
import { getProduct } from '../services/producto.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { obtenerClaseEstadoReg } from '../utils/StatusBadge.js';
import { TruncDots } from '../utils/TruncDots.js';
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
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
    const [filtroActivo, setFiltroActivo] = useState({ visible: false });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});
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

    const handleEliminarEntidad = async (entidad) => {
        const rel = await getWallet('', '', '', `entidadid:eq:${entidad.id}`);
        const rel2 = await getProduct('', '', '', `entidad.id:eq:${entidad.id}`);
        if (rel.items.length > 0 || rel2.items.length > 0) setEntidadNoEliminar(entidad);
        else setEntidadAEliminar(entidad);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setEntidadErp(null);
        await updateErpEntity();
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

    const toggleOrder = (field) => {
        const [currentField, dir] = query.order.split(",");
        const newDir = (currentField === field && dir === "asc") ? "desc" : "asc";

        setQuery(q => ({ ...q, order: `${field},${newDir}` }));
    };

    const getSortIcon = (field) => {
        const [currentField, direction] = query.order.split(",");

        if (currentField !== field) return "bi-chevron-expand";

        return direction === "asc"
            ? "bi-chevron-up"
            : "bi-chevron-down";
    };

    const generarFiltro = (f) => {
        if (!f.op) {
            setFiltroActivo({ ...filtroActivo, op: "eq" })
            f = ({ ...f, op: "eq" })
        }

        const field = f.field.trim();
        const op = f.op.trim();
        let filtro = "";

        if (op === "between") {
            if (!f.value1 || !f.value2) return null;
            filtro = `${field}:between:${f.value1}..${f.value2}`;
        } else {
            if (!f.value) return null;
            filtro = `${field}:${op}:${f.value}`;
        }

        return filtro;
    };

    const handleSubmit = (formData) => {
        guardarFn(formData);
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const rows = [...entidades];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {entidadErp && (
                <ImportErp setErp={setEntidadErp} title={'entidades'} fun={importarDatosERP} />
            )}
            {entidadAEliminar && (
                <Delete setEliminar={setEntidadAEliminar} title={'entidad'} gen={false} confirmar={confirmarEliminacion} id={entidadAEliminar.id} />
            )}
            {entidadNoEliminar && (
                <NotDelete setNoEliminar={setEntidadNoEliminar} title={'entidad'} gen={false} />
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

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'ENTIDADES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Entidades
                        </p>
                        <div className="p-3">
                            <FiltroModal
                                filtroActivo={filtroActivo}
                                setFiltroActivo={setFiltroActivo}
                                setQuery={setQuery}
                                setFiltrosAplicados={setFiltrosAplicados}
                                generarFiltro={generarFiltro}
                            />
                            <table className='table table-bordered table-sm table-hover m-0 border-secondary-subtle'>
                                <thead className='table-success'>
                                    <tr>
                                        <th onClick={() => toggleOrder("id")} className="sortable-header">
                                            #
                                            <i className={`bi ${getSortIcon("id")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["id"] ?? {};
                                                    setFiltroActivo({
                                                        field: "id",
                                                        type: "number",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("nomape")} className="sortable-header">
                                            Nombre/Apellido
                                            <i className={`bi ${getSortIcon("nomape")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nomape"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nomape",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("sucursal.sucursal")} className="sortable-header">
                                            Sucursal
                                            <i className={`bi ${getSortIcon("sucursal.sucursal")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["sucursal.sucursal"] ?? {};
                                                    setFiltroActivo({
                                                        field: "sucursal.sucursal",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("nrodoc")} className="sortable-header">
                                            Nro. de documento
                                            <i className={`bi ${getSortIcon("nrodoc")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nrodoc"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nrodoc",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("categorias")} className="sortable-header">
                                            Categoría
                                            <i className={`bi ${getSortIcon("categorias")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["categorias"] ?? {};
                                                    setFiltroActivo({
                                                        field: "categorias",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th onClick={() => toggleOrder("estado")} className="sortable-header">
                                            Estado
                                            <i className={`bi ${getSortIcon("estado")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["estado"] ?? {};
                                                    setFiltroActivo({
                                                        field: "estado",
                                                        type: "string",
                                                        visible: true,
                                                        op: previo.op,
                                                        value: previo.value,
                                                        value1: previo.value1,
                                                        value2: previo.value2,
                                                        coords: {
                                                            top: rect.bottom + 5,
                                                            left: rect.left
                                                        }
                                                    });
                                                }}
                                            ></i>
                                        </th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entidades.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-3 text-muted fs-3 fw-bold">
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.filter(v => v).map((v, index) => {
                                            const puedeEditar = permiso?.puedeeditar;
                                            const puedeEliminar = permiso?.puedeeliminar;
                                            const puedeVer = permiso?.puedever;
                                            return (
                                                <tr
                                                    className="text-center align-middle"
                                                    key={v ? v.id : `empty-${index}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (puedeEditar) setEntidadAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{TruncDots(v.nomape, 35)}</td>
                                                    <td>{v.sucursal?.sucursal}</td>
                                                    <td className='text-end'>{v.nrodoc}</td>
                                                    <td>{v.categorias}</td>
                                                    <td style={{ width: '140px' }}>
                                                        <p className={`text-center mx-auto w-75 ${obtenerClaseEstadoReg(v.activo)} m-0 rounded-2 border border-black`}>
                                                            {v.estado}
                                                        </p>
                                                    </td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarEntidad(v);
                                                            }}
                                                            className="btn border-0 me-2 p-0"
                                                            style={{ cursor: puedeEliminar ? 'pointer' : 'default' }}
                                                        >
                                                            <i className={`bi bi-trash-fill ${puedeEliminar ? 'text-danger' : 'text-danger-emphasis'}`}></i>
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (puedeVer) {
                                                                    await AddAccess('Visualizar', v.id, userLog, "Entidades");
                                                                    setEntidadAVisualizar(v);
                                                                }
                                                            }}
                                                            className="btn border-0 ms-2 p-0"
                                                            style={{ cursor: puedeVer ? 'pointer' : 'default' }}
                                                        >
                                                            <i className={`bi bi-eye-fill ${puedeVer ? 'text-primary' : 'text-primary-emphasis'}`}></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <ListControls
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
                            addData={selected}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
