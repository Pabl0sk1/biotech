import { useState, useEffect } from 'react';
import { getWallet, saveWallet, updateWallet, deleteWallet, updateErpWallet } from '../services/cartera.service.js';
import { getEntity } from '../services/entidad.service.js';
import { getPermission } from '../services/permiso.service.js';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from "../FiltroModal.jsx";
import { tienePermisoRuta } from '../utils/RouteAccess.js';
import { useNavigate } from 'react-router-dom';
import { ListControls } from '../ListControls.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const CarteraApp = ({ userLog }) => {

    const navigate = useNavigate();
    const [carteras, setCarteras] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [carteraAGuardar, setCarteraAGuardar] = useState(null);
    const [carteraAEliminar, setCarteraAEliminar] = useState(null);
    const [carteraNoEliminar, setCarteraNoEliminar] = useState(null);
    const [carteraAVisualizar, setCarteraAVisualizar] = useState(null);
    const [carteraErp, setCarteraErp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filtroActivo, setFiltroActivo] = useState({ visible: false });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});
    const [query, setQuery] = useState({
        page: 0,
        size: 10,
        order: "",
        filter: []
    });

    const [puedeCrearEntidad, setPuedeCrearEntidad] = useState(false);

    useEffect(() => {
        const loadPermiso = async () => {
            const ok1 = await tienePermisoRuta(['ca01'], userLog?.tipousuario?.id);
            setPuedeCrearEntidad(ok1);
        };

        if (userLog?.tipousuario?.id) {
            loadPermiso();
        }
    }, [userLog]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setCarteraAEliminar(null);
                setCarteraNoEliminar(null);
                setCarteraAVisualizar(null);
                setCarteraAGuardar(null);
                setCarteraErp(null);
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
        entidadid: 0,
        nombre: "",
        region: "",
        erpid: 0
    };

    const recuperarCarteras = () => {
        setQuery(q => ({ ...q }));
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:cm01`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getWallet(query.page, query.size, query.order, filtrosFinal);
            setCarteras(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarCarteraFn = async (id) => {
        setLoading(true);
        await deleteWallet(id);
        await AddAccess('Eliminar', id, userLog, "Carteras");
        recuperarCarteras();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarCarteraFn(id);
        setCarteraAEliminar(null);
    }

    const handleEliminarCartera = async (cartera) => {
        const rel = await getEntity('', '', '', `cartera.id:eq:${cartera?.id}`);
        if (rel.items.length > 0) setCarteraNoEliminar(cartera);
        else setCarteraAEliminar(cartera);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setCarteraErp(null);
        await updateErpWallet();
        recuperarCarteras();
        setLoading(false);
    }

    const guardarFn = async (carteraAGuardar) => {
        setCarteraAGuardar(null);
        setLoading(true);

        if (carteraAGuardar.id) {
            await updateWallet(carteraAGuardar.id, carteraAGuardar);
            await AddAccess('Modificar', carteraAGuardar.id, userLog, "Carteras");
        } else {
            const nuevoCartera = await saveWallet(carteraAGuardar);
            await AddAccess('Insertar', nuevoCartera.saved.id, userLog, "Carteras");
        }
        recuperarCarteras();
        setLoading(false);
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
            guardarFn({ ...carteraAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    }

    const rows = [...carteras];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {carteraErp && (
                <ImportErp setErp={setCarteraErp} title={'carteras'} fun={importarDatosERP} />
            )}
            {carteraAEliminar && (
                <Delete setEliminar={setCarteraAEliminar} title={'cartera'} gen={false} confirmar={confirmarEliminacion} id={carteraAEliminar.id} />
            )}
            {carteraNoEliminar && (
                <NotDelete setNoEliminar={setCarteraNoEliminar} title={'cartera'} gen={false} />
            )}

            {carteraAVisualizar && (
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
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={carteraAVisualizar.nombre || ''}
                                            readOnly
                                        />
                                        <label htmlFor="entidadid" className="form-label m-0 mb-2">Entidad ID</label>
                                        <input
                                            type="number"
                                            id="entidadid"
                                            name="entidadid"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={carteraAVisualizar.entidadid || ''}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <label htmlFor="region" className="form-label m-0 mb-2">Región</label>
                                        <input
                                            type="email"
                                            id="region"
                                            name="region"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={carteraAVisualizar.region || ''}
                                            readOnly
                                        />
                                        <div hidden={userLog?.id !== 1}>
                                            <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                            <input
                                                type="number"
                                                id="erpid"
                                                name="erpid"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={carteraAVisualizar.erpid || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setCarteraAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {carteraAGuardar && (
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
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={carteraAGuardar.nombre || ''}
                                                    onChange={(event) => setCarteraAGuardar({ ...carteraAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    autoFocus
                                                    maxLength={150}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El nombre es obligatorio y no debe sobrepasar los 150 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="entidadid" className="form-label m-0 mb-2">Entidad ID</label>
                                                <i style={{ cursor: puedeCrearEntidad ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearEntidad ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearEntidad) {
                                                            await AddAccess('Consultar', 0, userLog, 'Entidades')
                                                            navigate('/home/cadastres/entities');
                                                        }
                                                    }}>
                                                </i>
                                                <input
                                                    type="number"
                                                    id="entidadid"
                                                    name="entidadid"
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={carteraAGuardar.entidadid || ''}
                                                    onChange={(event) => setCarteraAGuardar({ ...carteraAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="region" className="form-label m-0 mb-2">Región</label>
                                                <input
                                                    type="text"
                                                    id="region"
                                                    name="region"
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={carteraAGuardar.region || ''}
                                                    onChange={(event) => setCarteraAGuardar({ ...carteraAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    maxLength={150}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La región es obligatoria y no debe sobrepasar los 150 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1' hidden={userLog?.id !== 1}>
                                                <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                                <input
                                                    type="number"
                                                    id="erpid"
                                                    name="erpid"
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={carteraAGuardar.erpid || ''}
                                                    onChange={(event) => setCarteraAGuardar({ ...carteraAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setCarteraAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <Header userLog={userLog} title={'CARTERAS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Carteras
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
                                        <th onClick={() => toggleOrder("nombre")} className="sortable-header">
                                            Vendedor
                                            <i className={`bi ${getSortIcon("nombre")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombre"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombre",
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
                                        <th onClick={() => toggleOrder("region")} className="sortable-header">
                                            Región
                                            <i className={`bi ${getSortIcon("region")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["region"] ?? {};
                                                    setFiltroActivo({
                                                        field: "region",
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
                                    {carteras.length === 0 ? (
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
                                                        if (puedeEditar) setCarteraAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.nombre}</td>
                                                    <td>{v.region}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarCartera(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Carteras");
                                                                    setCarteraAVisualizar(v);
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
                            onAdd={() => setCarteraAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setCarteraErp(true)}
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
