import { useState, useEffect } from 'react';
import { getPermission, savePermission, updatePermission, deletePermission } from '../services/permiso.service.js';
import { getRole } from '../services/tipousuario.service.js';
import { getModule } from '../services/modulo.service.js';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';

export const PermisoApp = ({ userLog }) => {

    const [permisos, setPermisos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [permisoAGuardar, setPermisoAGuardar] = useState(null);
    const [permisoAEliminar, setPermisoAEliminar] = useState(null);
    const [permisoNoEliminar, setPermisoNoEliminar] = useState(null);
    const [permisoAVisualizar, setPermisoAVisualizar] = useState(null);
    const [permisoDuplicado, setPermisoDuplicado] = useState(null);
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
                setPermisoAEliminar(null);
                setPermisoNoEliminar(null);
                setPermisoAVisualizar(null);
                setPermisoAGuardar(null);
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
        tipousuario: {
            id: 0
        },
        modulo: {
            id: 0
        },
        puedeconsultar: false,
        puedever: false,
        puedeagregar: false,
        puedeeliminar: false,
        puedeeditar: false
    };

    const recuperarPermisos = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarRoles = async () => {
        const response = await getRole();
        setRoles(response.items);
    }

    const recuperarModulos = async () => {
        const response = await getModule();
        setModulos(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog.tipousuario.id};modulo.var:eq:sc05`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getPermission(query.page, query.size, query.order, filtrosFinal);
            setPermisos(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            recuperarModulos();
            recuperarRoles();
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarPermisoFn = async (id) => {
        await deletePermission(id);
        await AddAccess('Eliminar', id, userLog, "Permisos");
        recuperarPermisos();
    };

    const confirmarEliminacion = (id) => {
        eliminarPermisoFn(id);
        setPermisoAEliminar(null);
    }

    const handleEliminarPermiso = (permiso) => {
        setPermisoAEliminar(permiso);
    };

    const guardarFn = async (permisoAGuardar) => {

        if (permisoAGuardar.id) {
            await updatePermission(permisoAGuardar.id, permisoAGuardar);
            await AddAccess('Modificar', permisoAGuardar.id, userLog, "Permisos");
        } else {
            const nuevoPermiso = await savePermission(permisoAGuardar);
            await AddAccess('Insertar', nuevoPermiso.saved.id, userLog, "Permisos");
        }
        setPermisoAGuardar(null);
        recuperarPermisos();
    };

    const verificarPermisoDuplicado = (dato) => {
        return permisos.some(p => p.tipousuario.id == dato.tipousuario.id && p.modulo.id == dato.modulo.id && p.id !== dato.id);
    }

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
        if (!permisoAGuardar.tipousuario || !permisoAGuardar.modulo) sw = 1;
        if (verificarPermisoDuplicado(permisoAGuardar)) {
            setPermisoAGuardar(null);
            setPermisoDuplicado(true);
            sw = 1;
        };

        if (sw === 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...permisoAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const rows = [...permisos];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {permisoDuplicado && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-dash-circle-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>El permiso ya existe</p>
                                </div>
                                <button
                                    onClick={() => setPermisoDuplicado(null)}
                                    className="btn btn-danger mt-3 fw-bold text-black">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {permisoAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar el permiso?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(permisoAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setPermisoAEliminar(null)}
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

            {permisoNoEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-database-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>El permiso está siendo referenciado en otra tabla</p>
                                </div>
                                <button
                                    onClick={() => setPermisoNoEliminar(null)}
                                    className="btn btn-danger mt-3 fw-bold text-black">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {permisoAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <label htmlFor="modulo" className="form-label m-0 mb-2">Modulo</label>
                                        <input
                                            type="text"
                                            id="modulo"
                                            name="modulo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={permisoAVisualizar.modulo.var}
                                            readOnly
                                        />
                                        <label htmlFor="tipousuario" className="form-label m-0 mb-2">Rol</label>
                                        <input
                                            type="text"
                                            id="tipousuario"
                                            name="tipousuario"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={permisoAVisualizar.tipousuario.tipousuario}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <p htmlFor="operaciones" className="mb-1 fw-bold text-decoration-underline">Operaciones</p>
                                        <div>
                                            <label htmlFor="puedeconsultar" className="form-label m-0 me-2">Consultar?</label>
                                            <input
                                                type="checkbox"
                                                id="puedeconsultar"
                                                name="puedeconsultar"
                                                className="form-check-input"
                                                checked={permisoAVisualizar.puedeconsultar}
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="puedeagregar" className="form-label m-0 me-2">Agregar?</label>
                                            <input
                                                type="checkbox"
                                                id="puedeagregar"
                                                name="puedeagregar"
                                                className="form-check-input"
                                                checked={permisoAVisualizar.puedeagregar}
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="puedeeliminar" className="form-label m-0 me-2">Eliminar?</label>
                                            <input
                                                type="checkbox"
                                                id="puedeeliminar"
                                                name="puedeeliminar"
                                                className="form-check-input"
                                                checked={permisoAVisualizar.puedeeliminar}
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="puedever" className="form-label m-0 me-2">Ver?</label>
                                            <input
                                                type="checkbox"
                                                id="puedever"
                                                name="puedever"
                                                className="form-check-input"
                                                checked={permisoAVisualizar.puedever}
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="puedeeditar" className="form-label m-0 me-2">Editar?</label>
                                            <input
                                                type="checkbox"
                                                id="puedeeditar"
                                                name="puedeeditar"
                                                className="form-check-input"
                                                checked={permisoAVisualizar.puedeeditar}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setPermisoAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {permisoAGuardar && (
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
                                                <label htmlFor="modulo" className="form-label m-0 mb-2">Modulo</label>
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="modulo"
                                                    id='modulo'
                                                    value={permisoAGuardar.modulo ? permisoAGuardar.modulo.id : ''}
                                                    onChange={(event) => {
                                                        const selectedModulo = modulos.find(r => r.id === parseInt(event.target.value));
                                                        setPermisoAGuardar({
                                                            ...permisoAGuardar,
                                                            modulo: selectedModulo
                                                        });
                                                    }}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione un modulo...</option>
                                                    {modulos.map((tp) => (
                                                        <option key={tp.id} value={tp.id}>{tp.moduloes}</option>
                                                    ))}
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El modulo es obligatorio.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="tipousuario" className="form-label m-0 mb-2">Rol</label>
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="tipousuario"
                                                    id='tipousuario'
                                                    value={permisoAGuardar.tipousuario ? permisoAGuardar.tipousuario.id : ''}
                                                    onChange={(event) => {
                                                        const selectedTipousuario = roles.find(r => r.id === parseInt(event.target.value));
                                                        setPermisoAGuardar({
                                                            ...permisoAGuardar,
                                                            tipousuario: selectedTipousuario
                                                        });
                                                    }}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione un rol...</option>
                                                    {roles.map((tp) => (
                                                        <option key={tp.id} value={tp.id}>{tp.tipousuario}</option>
                                                    ))}
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El rol es obligatorio.
                                                </div>
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <p htmlFor="operaciones" className="mb-1 fw-bold text-decoration-underline">Operaciones</p>
                                            <div className='form-group'>
                                                <label htmlFor="puedeconsultar" className="form-label m-0 me-2">Consultar?</label>
                                                <input
                                                    type="checkbox"
                                                    id="puedeconsultar"
                                                    name="puedeconsultar"
                                                    className="form-check-input"
                                                    checked={permisoAGuardar.puedeconsultar}
                                                    onChange={(e) => {
                                                        const estaChequeado = e.target.checked;
                                                        setPermisoAGuardar({ ...permisoAGuardar, [e.target.name]: estaChequeado })
                                                    }}
                                                />
                                            </div>
                                            <div className='form-group'>
                                                <label htmlFor="puedeagregar" className="form-label m-0 me-2">Agregar?</label>
                                                <input
                                                    type="checkbox"
                                                    id="puedeagregar"
                                                    name="puedeagregar"
                                                    className="form-check-input"
                                                    checked={permisoAGuardar.puedeagregar}
                                                    onChange={(e) => {
                                                        const estaChequeado = e.target.checked;
                                                        setPermisoAGuardar({ ...permisoAGuardar, [e.target.name]: estaChequeado })
                                                    }}
                                                />
                                            </div>
                                            <div className='form-group'>
                                                <label htmlFor="puedeeliminar" className="form-label m-0 me-2">Eliminar?</label>
                                                <input
                                                    type="checkbox"
                                                    id="puedeeliminar"
                                                    name="puedeeliminar"
                                                    className="form-check-input"
                                                    checked={permisoAGuardar.puedeeliminar}
                                                    onChange={(e) => {
                                                        const estaChequeado = e.target.checked;
                                                        setPermisoAGuardar({ ...permisoAGuardar, [e.target.name]: estaChequeado })
                                                    }}
                                                />
                                            </div>
                                            <div className='form-group'>
                                                <label htmlFor="puedever" className="form-label m-0 me-2">Ver?</label>
                                                <input
                                                    type="checkbox"
                                                    id="puedever"
                                                    name="puedever"
                                                    className="form-check-input"
                                                    checked={permisoAGuardar.puedever}
                                                    onChange={(e) => {
                                                        const estaChequeado = e.target.checked;
                                                        setPermisoAGuardar({ ...permisoAGuardar, [e.target.name]: estaChequeado })
                                                    }}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="puedeeditar" className="form-label m-0 me-2">Editar?</label>
                                                <input
                                                    type="checkbox"
                                                    id="puedeeditar"
                                                    name="puedeeditar"
                                                    className="form-check-input"
                                                    checked={permisoAGuardar.puedeeditar}
                                                    onChange={(e) => {
                                                        const estaChequeado = e.target.checked;
                                                        setPermisoAGuardar({ ...permisoAGuardar, [e.target.name]: estaChequeado })
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setPermisoAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <Header userLog={userLog} title={'PERMISOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Permisos
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
                                        <th onClick={() => toggleOrder("modulo.var")} className="sortable-header">
                                            Variable
                                            <i className={`bi ${getSortIcon("modulo.var")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["modulo.var"] ?? {};
                                                    setFiltroActivo({
                                                        field: "modulo.var",
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
                                        <th onClick={() => toggleOrder("modulo.moduloes")} className="sortable-header">
                                            Modulo
                                            <i className={`bi ${getSortIcon("modulo.moduloes")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["modulo.moduloes"] ?? {};
                                                    setFiltroActivo({
                                                        field: "modulo.moduloes",
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
                                        <th onClick={() => toggleOrder("tipousuario.tipousuario")} className="sortable-header">
                                            Rol
                                            <i className={`bi ${getSortIcon("tipousuario.tipousuario")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["tipousuario.tipousuario"] ?? {};
                                                    setFiltroActivo({
                                                        field: "tipousuario.tipousuario",
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
                                    {permisos.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-3 text-muted fs-3 fw-bold">
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
                                                        if (puedeEditar) setPermisoAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td>{v.modulo.var}</td>
                                                    <td>{v.modulo.moduloes}</td>
                                                    <td>{v.tipousuario.tipousuario}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarPermiso(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Permisos");
                                                                    setPermisoAVisualizar(v);
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
                            <button onClick={() => setPermisoAGuardar(selected)} className="btn btn-secondary fw-bold me-2" disabled={!permiso?.puedeagregar}>
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
