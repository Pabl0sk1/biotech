import { useState, useEffect } from 'react';
import { getSeller, saveSeller, updateSeller, deleteSeller } from '../services/vendedor.service.js';
import { getPermission } from '../services/permiso.service.js';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from "../FiltroModal.jsx";
import { DateHourFormat } from '../utils/DateHourFormat.js';

export const VendedorApp = ({ userLog }) => {

    const [vendedores, setVendedores] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [vendedorAGuardar, setVendedorAGuardar] = useState(null);
    const [vendedorAEliminar, setVendedorAEliminar] = useState(null);
    const [vendedorNoEliminar, setVendedorNoEliminar] = useState(null);
    const [vendedorAVisualizar, setVendedorAVisualizar] = useState(null);
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
                setVendedorAEliminar(null);
                setVendedorNoEliminar(null);
                setVendedorAVisualizar(null);
                setVendedorAGuardar(null);
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
        nomape: "",
        nombre: "",
        apellido: "",
        nrodoc: "",
        nrotelefono: "",
        correo: "",
        fechanacimiento: ""
    };

    const recuperarVendedores = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:rg02`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getSeller(query.page, query.size, query.order, filtrosFinal);
            setVendedores(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarVendedorFn = async (id) => {
        await deleteSeller(id);
        await AddAccess('Eliminar', id, userLog, "Vendedores");
        recuperarVendedores();
    };

    const confirmarEliminacion = (id) => {
        eliminarVendedorFn(id);
        setVendedorAEliminar(null);
    }

    const handleEliminarVendedor = (vendedor) => {
        setVendedorAEliminar(vendedor);
    };

    const guardarFn = async (vendedorAGuardar) => {

        const vendedorActualizado = {
            ...vendedorAGuardar,
            nomape: vendedorAGuardar.nombre + ", " + vendedorAGuardar.apellido,
        };

        if (vendedorActualizado.id) {
            await updateSeller(vendedorActualizado.id, vendedorActualizado);
            await AddAccess('Modificar', vendedorActualizado.id, userLog, "Vendedores");
        } else {
            const nuevoVendedor = await saveSeller(vendedorActualizado);
            await AddAccess('Insertar', nuevoVendedor.saved.id, userLog, "Vendedores");
        }
        setVendedorAGuardar(null);
        recuperarVendedores();
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

        if (form.checkValidity()) {
            guardarFn({ ...vendedorAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    }

    const rows = [...vendedores];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {vendedorAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar el vendedor?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(vendedorAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setVendedorAEliminar(null)}
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

            {vendedorNoEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-database-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>El vendedor está siendo referenciado en otra tabla</p>
                                </div>
                                <button
                                    onClick={() => setVendedorNoEliminar(null)}
                                    className="btn btn-danger mt-3 fw-bold text-black">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {vendedorAVisualizar && (
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
                                            value={vendedorAVisualizar.nombre}
                                            readOnly
                                        />
                                        <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                        <input
                                            type="text"
                                            id="nrotelefono"
                                            name="nrotelefono"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={vendedorAVisualizar.nrotelefono}
                                            readOnly
                                        />
                                        <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                        <input
                                            type="text"
                                            id="nrodoc"
                                            name="nrodoc"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={vendedorAVisualizar.nrodoc}
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
                                            value={vendedorAVisualizar.apellido}
                                            readOnly
                                        />
                                        <label htmlFor="fechanacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            id="fechanacimiento"
                                            name="fechanacimiento"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={vendedorAVisualizar.fechanacimiento || ''}
                                            readOnly
                                        />
                                        <label htmlFor="correo" className="form-label m-0 mb-2">Correo</label>
                                        <input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={vendedorAVisualizar.correo || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setVendedorAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {vendedorAGuardar && (
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
                                                    value={vendedorAGuardar.nombre}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
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
                                                    value={vendedorAGuardar.nrotelefono}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={15}
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
                                                    value={vendedorAGuardar.nrodoc}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={15}
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
                                                    value={vendedorAGuardar.apellido}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El apellido es obligatorio y no debe sobrepasar los 50 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="fechanacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                                <input
                                                    type="date"
                                                    id="fechanacimiento"
                                                    name="fechanacimiento"
                                                    className="form-control border-input w-100"
                                                    value={vendedorAGuardar.fechanacimiento || ''}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="correo" className="form-label m-0 mb-2">Correo</label>
                                                <input
                                                    type="email"
                                                    id="correo"
                                                    name="correo"
                                                    className="form-control border-input w-100"
                                                    placeholder='Escribe...'
                                                    value={vendedorAGuardar.correo || ''}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setVendedorAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <Header userLog={userLog} title={'VENDEDORES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Vendedores
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
                                    {vendedores.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-3 text-muted fs-3 fw-bold">
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
                                                        if (puedeEditar) setVendedorAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.nomape}</td>
                                                    <td className='text-end'>{v.nrodoc}</td>
                                                    <td>{DateHourFormat(v.fechanacimiento, 0)}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarVendedor(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Vendedores");
                                                                    setVendedorAVisualizar(v);
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
                            <button onClick={() => setVendedorAGuardar(selected)} className="btn btn-secondary fw-bold me-2" disabled={!permiso?.puedeagregar}>
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
