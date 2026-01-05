import { useState, useEffect } from 'react';
import { getEntity, saveEntity, updateEntity, deleteEntity, updateErpEntity } from '../services/entidad.service.js';
import { getPosition } from '../services/cargo.service.js';
import { getBranch } from '../services/sucursal.service.js';
import { getWallet } from '../services/cartera.service.js';
import { getEntityType } from '../services/tipoentidad.service.js';
import { getProduct } from '../services/producto.service.js';
import { getPermission } from '../services/permiso.service.js';
import { NumericFormat } from 'react-number-format';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { tienePermisoRuta } from '../utils/RouteAccess.js';
import { useNavigate } from 'react-router-dom';
import AutocompleteSelect from '../AutocompleteSelect.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';
import { TruncDots } from '../utils/TruncDots.js';

export const EntidadApp = ({ userLog }) => {

    const navigate = useNavigate();
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

    const [puedeCrearCargo, setPuedeCrearCargo] = useState(false);
    const [puedeCrearSucursal, setPuedeCrearSucursal] = useState(false);
    const [puedeCrearCartera, setPuedeCrearCartera] = useState(false);
    const [puedeCrearCategoria, setPuedeCrearCategoria] = useState(false);

    useEffect(() => {
        const loadPermiso = async () => {
            const ok1 = await tienePermisoRuta(['rh01'], userLog?.tipousuario?.id);
            setPuedeCrearCargo(ok1);
            const ok2 = await tienePermisoRuta(['gr03'], userLog?.tipousuario?.id);
            setPuedeCrearSucursal(ok2);
            const ok3 = await tienePermisoRuta(['cm01'], userLog?.tipousuario?.id);
            setPuedeCrearCartera(ok3);
            const ok4 = await tienePermisoRuta(['gr06'], userLog?.tipousuario?.id);
            setPuedeCrearCategoria(ok4);
        };

        if (userLog?.tipousuario?.id) {
            loadPermiso();
        }
    }, [userLog]);

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

    useEffect(() => {
        const forms = document.querySelectorAll('.needs-validation');
        Array.from(forms).forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, []);

    const selected = {
        id: null,
        cargo: null,
        sucursal: null,
        cartera: null,
        categorias: [],
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
        erpid: 0
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
            recuperarCargos();
            recuperarSucursales();
            recuperarCarteras();
            recuperarCategorias();
            permisoUsuario();
        };
        load();
    }, [query]);

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
        const rel = await getWallet('', '', '', `entidad.id:eq:${entidad.id}`);
        const rel2 = await getProduct('', '', '', `entidad.id:eq:${entidad.id}`)
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

    const guardarFn = async (entidadAGuardar) => {
        setLoading(true);

        let activo = true;
        if (entidadAGuardar.estado == 'Inactivo') activo = false;

        let apellido = "";
        if (entidadAGuardar.apellido) apellido = ", " + entidadAGuardar.apellido;

        const entidadActualizado = {
            ...entidadAGuardar,
            nomape: entidadAGuardar.nombre + apellido,
            activo: activo
        };

        if (entidadActualizado.id) {
            await updateEntity(entidadActualizado.id, entidadActualizado);
            await AddAccess('Modificar', entidadActualizado.id, userLog, "Entidades");
        } else {
            const nuevoEntidad = await saveEntity(entidadActualizado);
            await AddAccess('Insertar', nuevoEntidad.saved.id, userLog, "Entidades");
        }
        setEntidadAGuardar(null);
        recuperarEntidades();
        setLoading(false);
    };

    const nextPage = () => {
        if (query.page + 1 < totalPages) setQuery(q => ({ ...q, page: q.page + 1 }));
    };

    const prevPage = () => {
        if (query.page > 0) setQuery(q => ({ ...q, page: q.page - 1 }));
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

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        let sw = 0;
        if (!entidadAGuardar.categorias || !entidadAGuardar.nombre) sw = 1;

        if (sw === 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...entidadAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const obtenerClaseEstado = (activo) => {
        return activo ? 'text-bg-success' : 'text-bg-danger';
    };

    const getCategoriasSeleccionadas = () => {
        if (entidadAGuardar.categorias.length == 0) return [];

        const categoriasArray = entidadAGuardar.categorias.split(',').map(c => c.trim());

        return categorias.filter(v =>
            categoriasArray.includes(v.tipoentidad)
        );
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
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <label htmlFor="nombre" className="form-label m-0 mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.nombre || ''}
                                            readOnly
                                        />
                                        <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                        <input
                                            type="text"
                                            id="nrotelefono"
                                            name="nrotelefono"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.nrotelefono || ''}
                                            readOnly
                                        />
                                        <label htmlFor="salario" className="form-label m-0 mb-2">Salario</label>
                                        <NumericFormat
                                            value={entidadAVisualizar.salario || 0}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix={'Gs. '}
                                            className="form-control border-input w-100 border-black mb-3"
                                            readOnly
                                        />
                                        <label htmlFor="correo" className="form-label m-0 mb-2">Correo</label>
                                        <input
                                            type="text"
                                            id="correo"
                                            name="correo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.correo || ''}
                                            readOnly
                                        />
                                        <label htmlFor="fechainicio" className="form-label m-0 mb-2">Fecha de Inicio</label>
                                        <input
                                            type="date"
                                            id="fechainicio"
                                            name="fechainicio"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.fechainicio || ''}
                                            readOnly
                                        />
                                        <label htmlFor="cargo" className="form-label m-0 mb-2">Cargo</label>
                                        <input
                                            type="text"
                                            id="cargo"
                                            name="cargo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.cargo?.cargo || ''}
                                            readOnly
                                        />
                                        <label htmlFor="cartera" className="form-label m-0 mb-2">Cartera</label>
                                        <input
                                            type="text"
                                            id="cartera"
                                            name="cartera"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.cartera?.nombre || ''}
                                            readOnly
                                        />
                                        <label htmlFor="estado" className="form-label m-0 mb-2">Estado</label>
                                        <input
                                            type="text"
                                            id="estado"
                                            name="estado"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.estado || ''}
                                            readOnly
                                        />
                                        <div hidden={!userLog?.id == 1}>
                                            <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                            <input
                                                type="number"
                                                id="erpid"
                                                name="erpid"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={entidadAVisualizar.erpid || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <label htmlFor="apellido" className="form-label m-0 mb-2">Apellido</label>
                                        <input
                                            type="text"
                                            id="apellido"
                                            name="apellido"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.apellido || ''}
                                            readOnly
                                        />
                                        <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                        <input
                                            type="text"
                                            id="nrodoc"
                                            name="nrodoc"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.nrodoc || ''}
                                            readOnly
                                        />
                                        <label htmlFor="codzktime" className="form-label m-0 mb-2">Código ZKTime</label>
                                        <NumericFormat
                                            value={entidadAVisualizar.codzktime || 0}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            className="form-control border-input w-100 border-black mb-3"
                                            readOnly
                                        />
                                        <label htmlFor="fechanacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            id="fechanacimiento"
                                            name="fechanacimiento"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.fechanacimiento || ''}
                                            readOnly
                                        />
                                        <label htmlFor="fechafin" className="form-label m-0 mb-2">Fecha de Final</label>
                                        <input
                                            type="date"
                                            id="fechafin"
                                            name="fechafin"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.fechafin || ''}
                                            readOnly
                                        />
                                        <label htmlFor="sucursal" className="form-label m-0 mb-2">Sucursal</label>
                                        <input
                                            type="text"
                                            id="sucursal"
                                            name="sucursal"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.sucursal?.sucursal || ''}
                                            readOnly
                                        />
                                        <label htmlFor="categoria" className="form-label m-0 mb-2">Categoría</label>
                                        <input
                                            type="text"
                                            id="categoria"
                                            name="categoria"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.categorias || ''}
                                            readOnly
                                        />
                                        <label htmlFor="horaextra" className="form-label m-0 mb-2 me-2 d-flex">Hora Extra</label>
                                        <input
                                            type="checkbox"
                                            id="horaextra"
                                            name="horaextra"
                                            className="form-check-input"
                                            style={{ width: '60px', height: '30px' }}
                                            checked={entidadAVisualizar.horaextra || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setEntidadAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {entidadAGuardar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <form
                                    action="url.ph"
                                    onSubmit={handleSubmit}
                                    className="needs-validation"
                                    noValidate
                                >
                                    <div className="row mb-3 fw-semibold text-start">
                                        {/*Columna 1 de visualizar*/}
                                        <div className='col me-5 pe-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nombre" className="form-label m-0 mb-2">Nombre</label>
                                                <input
                                                    type="text"
                                                    id="nombre"
                                                    name="nombre"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={entidadAGuardar.nombre || ''}
                                                    onChange={(event) => setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    autoFocus
                                                    maxLength={150}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El nombre es obligatorio y no debe sobrepasar los 150 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                                <input
                                                    type="text"
                                                    id="nrotelefono"
                                                    name="nrotelefono"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={entidadAGuardar.nrotelefono || ''}
                                                    onChange={(event) => setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="salario" className="form-label m-0 mb-2">Salario</label>
                                                <NumericFormat
                                                    type="text"
                                                    id="salario"
                                                    name="salario"
                                                    className="form-control border-input w-100"
                                                    displayType="input"
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    prefix={'Gs. '}
                                                    value={entidadAGuardar.salario === 0 ? 0 : entidadAGuardar.salario || ''}
                                                    placeholder='Escribe...'
                                                    min={0}
                                                    onChange={(event) => {
                                                        const value = event.target.value.replace(/[^0-9]/g, '');
                                                        setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: value === '' ? '' : parseFloat(value) || 0 })
                                                    }}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="correo" className="form-label m-0 mb-2">Correo</label>
                                                <input
                                                    type="text"
                                                    id="correo"
                                                    name="correo"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={entidadAGuardar.correo || ''}
                                                    onChange={(event) => setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="fechainicio" className="form-label m-0 mb-2">Fecha de Inicio</label>
                                                <input
                                                    type="date"
                                                    id="fechainicio"
                                                    name="fechainicio"
                                                    className="form-control border-input w-100"
                                                    value={entidadAGuardar.fechainicio || ''}
                                                    onChange={(event) => setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="cargo" className="form-label m-0 mb-2">Cargo</label>
                                                <i style={{ cursor: puedeCrearCargo ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearCargo ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearCargo) {
                                                            await AddAccess('Consultar', 0, userLog, 'Cargos')
                                                            navigate('/home/config/rrhh/positions')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={cargos}
                                                    value={entidadAGuardar.cargo}
                                                    getLabel={(v) => v.cargo}
                                                    searchFields={[
                                                        v => v.cargo
                                                    ]}
                                                    onChange={(v) =>
                                                        setEntidadAGuardar({
                                                            ...entidadAGuardar,
                                                            cargo: v
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="cartera" className="form-label m-0 mb-2">Cartera</label>
                                                <i style={{ cursor: puedeCrearCartera ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearCartera ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearCartera) {
                                                            await AddAccess('Consultar', 0, userLog, 'Carteras')
                                                            navigate('/home/config/commercial/wallets')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={carteras}
                                                    value={entidadAGuardar.cartera}
                                                    getLabel={(v) => v.nombre}
                                                    searchFields={[
                                                        v => v.nombre
                                                    ]}
                                                    onChange={(v) =>
                                                        setEntidadAGuardar({
                                                            ...entidadAGuardar,
                                                            cartera: v
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="estado" className="form-label m-0 mb-2">Estado</label>
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="estado"
                                                    id='estado'
                                                    value={entidadAGuardar.estado ? entidadAGuardar.estado : ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                    disabled={!entidadAGuardar.id}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione un estado...</option>
                                                    <option key={1} value={'Activo'}>Activo</option>
                                                    <option key={2} value={'Inactivo'}>Inactivo</option>
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El estado es obligatorio.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1' hidden={!userLog?.id == 1}>
                                                <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                                <input
                                                    type="number"
                                                    id="erpid"
                                                    name="erpid"
                                                    className="form-control border-input w-100"
                                                    value={entidadAGuardar.erpid || ''}
                                                    onChange={(event) => setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="apellido" className="form-label m-0 mb-2">Apellido</label>
                                                <input
                                                    type="text"
                                                    id="apellido"
                                                    name="apellido"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={entidadAGuardar.apellido || ''}
                                                    onChange={(event) => setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={150}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                                <input
                                                    type="text"
                                                    id="nrodoc"
                                                    name="nrodoc"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={entidadAGuardar.nrodoc || ''}
                                                    onChange={(event) => setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="codigo" className="form-label m-0 mb-2">Código ZKTime</label>
                                                <NumericFormat
                                                    type="text"
                                                    id="codigo"
                                                    name="codigo"
                                                    className="form-control border-input w-100"
                                                    displayType="input"
                                                    value={entidadAGuardar.codigo === 0 ? 0 : entidadAGuardar.codigo || ''}
                                                    placeholder='Escribe...'
                                                    min={0}
                                                    onChange={(event) => {
                                                        const value = event.target.value.replace(/[^0-9]/g, '');
                                                        setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: value === '' ? '' : parseFloat(value) || 0 })
                                                    }}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="fechanacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                                <input
                                                    type="date"
                                                    id="fechanacimiento"
                                                    name="fechanacimiento"
                                                    className="form-control border-input w-100"
                                                    value={entidadAGuardar.fechanacimiento || ''}
                                                    onChange={(event) => setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="fechafin" className="form-label m-0 mb-2">Fecha de Final</label>
                                                <input
                                                    type="date"
                                                    id="fechafin"
                                                    name="fechafin"
                                                    className="form-control border-input w-100"
                                                    value={entidadAGuardar.fechafin || ''}
                                                    onChange={(event) => setEntidadAGuardar({ ...entidadAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="sucursal" className="form-label m-0 mb-2">Sucursal</label>
                                                <i style={{ cursor: puedeCrearSucursal ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearSucursal ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearSucursal) {
                                                            await AddAccess('Consultar', 0, userLog, 'Sucursales')
                                                            navigate('/home/config/general/branchs')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={sucursales}
                                                    value={entidadAGuardar.sucursal}
                                                    getLabel={(v) => v.sucursal}
                                                    searchFields={[
                                                        v => v.sucursal
                                                    ]}
                                                    onChange={(v) =>
                                                        setEntidadAGuardar({
                                                            ...entidadAGuardar,
                                                            sucursal: v
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="categoria" className="form-label m-0 mb-2">Categoría</label>
                                                <i style={{ cursor: puedeCrearCategoria ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearCategoria ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearCategoria) {
                                                            await AddAccess('Consultar', 0, userLog, 'Categorias')
                                                            navigate('/home/config/general/categories')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={categorias}
                                                    value={getCategoriasSeleccionadas(entidadAGuardar.categorias)}
                                                    getLabel={(v) => v.tipoentidad}
                                                    searchFields={[
                                                        v => v.tipoentidad
                                                    ]}
                                                    onChange={(v) => {
                                                        const categoriasString = v.map(c => c.tipoentidad).join(',');
                                                        setEntidadAGuardar({
                                                            ...entidadAGuardar,
                                                            categorias: categoriasString
                                                        });
                                                    }}
                                                    multiple={true}
                                                    required={true}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="horaextra" className="form-label m-0 mb-2 me-2 d-flex">Hora Extra</label>
                                                <input
                                                    type="checkbox"
                                                    id="horaextra"
                                                    name="horaextra"
                                                    className="form-check-input"
                                                    style={{ width: '60px', height: '30px' }}
                                                    checked={entidadAGuardar.horaextra || ''}
                                                    onChange={(e) => {
                                                        const check = e.target.checked;
                                                        setEntidadAGuardar({ ...entidadAGuardar, [e.target.name]: check });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setEntidadAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
                                            <i className="bi bi-x-lg me-2"></i>Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
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
                                                    <td className='text-start' style={{ width: '300px' }}>{TruncDots(v.nomape)}</td>
                                                    <td>{v.sucursal?.sucursal}</td>
                                                    <td className='text-end'>{v.nrodoc}</td>
                                                    <td>{v.categorias}</td>
                                                    <td style={{ width: '140px' }}>
                                                        <p className={`text-center mx-auto w-75 ${obtenerClaseEstado(v.activo)} m-0 rounded-2 border border-black`}>
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
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => setEntidadAGuardar(selected)} className="btn btn-secondary fw-bold me-2" disabled={!permiso?.puedeagregar}>
                                <i className="bi bi-plus-circle"></i>
                            </button>
                            <button onClick={() => refrescar()} className="btn btn-secondary fw-bold ms-2 me-2">
                                <i className="bi bi-arrow-repeat"></i>
                            </button>
                            <button onClick={() => setEntidadErp(true)} className="btn btn-secondary fw-bold ms-2 me-2">
                                <i className="bi bi-cloud-check"></i>
                            </button>
                            <div className="d-flex align-items-center ms-5">
                                <label className="me-2 fw-semibold">Tamaño</label>
                                <select
                                    className="form-select form-select-sm border-black"
                                    value={query.size}
                                    onChange={(e) => {
                                        const newSize = Number(e.target.value);
                                        setQuery(q => ({
                                            ...q,
                                            page: 0,
                                            size: newSize
                                        }));
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={30}>30</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="d-flex align-items-center ms-5">
                                <label className="me-2 fw-semibold">Total</label>{totalItems}
                            </div>
                            <nav aria-label="page navigation" className='user-select-none ms-auto'>
                                <ul className="pagination m-0">
                                    <li className={`page-item ${query.page == 0 ? 'disabled' : ''}`}>
                                        <button className={`page-link ${query.page == 0 ? 'rounded-end-0 border-black' : 'text-bg-light rounded-end-0 border-black'}`} onClick={() => prevPage()}>
                                            <i className="bi bi-arrow-left"></i>
                                        </button>
                                    </li>
                                    <li className="page-item disabled">
                                        <button className="page-link text-bg-secondary rounded-0 fw-bold border-black">{query.page + 1} de {totalPages ? totalPages : 1}</button>
                                    </li>
                                    <li className={`page-item ${query.page + 1 >= totalPages ? 'disabled' : ''}`}>
                                        <button className={`page-link ${query.page + 1 >= totalPages ? 'rounded-start-0 border-black' : 'text-bg-light rounded-start-0 border-black'}`} onClick={() => nextPage()}>
                                            <i className="bi bi-arrow-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
