import { useState, useEffect } from 'react';
import { getEntity, saveEntity, updateEntity, deleteEntity } from '../services/entidad.service.js';
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
import { DateHourFormat } from '../utils/DateHourFormat.js';

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
    const [sugerencias, setSugerencias] = useState([]);
    const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
    const [cargoMsj, setCargoMsj] = useState('');
    const [cargoError, setCargoError] = useState(false);
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
        cargo: {
            id: 0
        },
        sucursal: {
            id: 0
        },
        cartera: {
            id: 0
        },
        tipoentidad: {
            id: 0
        },
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
        await deleteEntity(id);
        await AddAccess('Eliminar', id, userLog, "Entidades");
        recuperarEntidades();
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

    const guardarFn = async (entidadAGuardar) => {

        let activo = true;
        if (entidadAGuardar.estado == 'Inactivo') activo = false;

        const entidadActualizado = {
            ...entidadAGuardar,
            nomape: entidadAGuardar.nombre + ", " + entidadAGuardar.apellido,
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
        if (!entidadAGuardar.sucursal) sw = 1;
        if (!entidadAGuardar.cargo.cargo || entidadAGuardar.cargo.cargo.trim() === '') {
            setCargoMsj('El cargo es obligatorio.');
            setCargoError(true);
            sw = 1;
        }

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

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const rows = [...entidades];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {entidadAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar la entidad?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(entidadAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setEntidadAEliminar(null)}
                                        className="btn btn-danger text-black ms-4 fw-bold"
                                    >
                                        <i className="bi bi-x-lg me-2"></i>Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {entidadNoEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-database-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>La entidad está siendo referenciado en otra tabla</p>
                                </div>
                                <button
                                    onClick={() => setEntidadNoEliminar(null)}
                                    className="btn btn-danger mt-3 fw-bold text-black">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
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
                                            value={entidadAVisualizar.cargo.cargo || ''}
                                            readOnly
                                        />
                                        <label htmlFor="cartera" className="form-label m-0 mb-2">Cartera</label>
                                        <input
                                            type="text"
                                            id="cartera"
                                            name="cartera"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.cargo.nombre || ''}
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
                                            value={entidadAVisualizar.sucursal.sucursal || ''}
                                            readOnly
                                        />
                                        <label htmlFor="categoria" className="form-label m-0 mb-2">Categoría</label>
                                        <input
                                            type="text"
                                            id="categoria"
                                            name="categoria"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={entidadAVisualizar.tipoentidad.tipoentidad || ''}
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
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El nombre es obligatorio y no debe sobrepasar los 50 caracteres.
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
                                                    maxLength={15}
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
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="cargo"
                                                    id='cargo'
                                                    value={entidadAGuardar.cargo ? entidadAGuardar.cargo.id : ''}
                                                    onChange={(event) => {
                                                        const selected = cargos.find(r => r.id === parseInt(event.target.value));
                                                        setEntidadAGuardar({
                                                            ...entidadAGuardar,
                                                            cargo: selected
                                                        });
                                                    }}
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione un cargo...</option>
                                                    {cargos.map((tp) => (
                                                        <option key={tp.id} value={tp.id}>{tp.cargo}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="cartera" className="form-label m-0 mb-2">Cartera</label>
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="cartera"
                                                    id='cartera'
                                                    value={entidadAGuardar.cartera ? entidadAGuardar.cartera.id : ''}
                                                    onChange={(event) => {
                                                        const selected = carteras.find(r => r.id === parseInt(event.target.value));
                                                        setEntidadAGuardar({
                                                            ...entidadAGuardar,
                                                            cartera: selected
                                                        });
                                                    }}
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione una cartera...</option>
                                                    {carteras.map((tp) => (
                                                        <option key={tp.id} value={tp.id}>{tp.nombre}</option>
                                                    ))}
                                                </select>
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
                                                    required
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El apellido es obligatorio y no debe sobrepasar los 50 caracteres.
                                                </div>
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
                                                    maxLength={15}
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
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="sucursal"
                                                    id='sucursal'
                                                    value={entidadAGuardar.sucursal ? entidadAGuardar.sucursal.id : ''}
                                                    onChange={(event) => {
                                                        const selected = sucursales.find(r => r.id === parseInt(event.target.value));
                                                        setEntidadAGuardar({
                                                            ...entidadAGuardar,
                                                            sucursal: selected
                                                        });
                                                    }}
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione una sucursal...</option>
                                                    {sucursales.map((tp) => (
                                                        <option key={tp.id} value={tp.id}>{tp.sucursal}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="categoria" className="form-label m-0 mb-2">Categoría</label>
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="categoria"
                                                    id='categoria'
                                                    value={entidadAGuardar.tipoentidad ? entidadAGuardar.tipoentidad.id : ''}
                                                    onChange={(event) => {
                                                        const selected = categorias.find(r => r.id === parseInt(event.target.value));
                                                        setEntidadAGuardar({
                                                            ...entidadAGuardar,
                                                            tipoentidad: selected
                                                        });
                                                    }}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione una categoría...</option>
                                                    {categorias.map((tp) => (
                                                        <option key={tp.id} value={tp.id}>{tp.tipoentidad}</option>
                                                    ))}
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La categoría es obligatoria.
                                                </div>
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
                                        <th onClick={() => toggleOrder("fechanacimiento")} className="sortable-header">
                                            Fecha de Nacimiento
                                            <i className={`bi ${getSortIcon("fechanacimiento")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["fechanacimiento"] ?? {};
                                                    setFiltroActivo({
                                                        field: "fechanacimiento",
                                                        type: "date",
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
                                            <td colSpan="6" className="text-center py-3 text-muted fs-3 fw-bold">
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
                                                    <td className='text-start'>{v.nomape}</td>
                                                    <td>{v.sucursal.sucursal}</td>
                                                    <td className='text-end'>{v.nrodoc}</td>
                                                    <td>{DateHourFormat(v.fechanacimiento, 0)}</td>
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
