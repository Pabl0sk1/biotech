import { useState, useEffect } from 'react';
import { getProductGroup, saveProductGroup, updateProductGroup, deleteProductGroup, updateErpProductGroup } from '../services/grupoproducto.service.js';
import { getCurrency } from '../services/moneda.service.js';
import { getTaxation } from '../services/tributaciones.service.js';
import { getCommercial } from '../services/nombrecomercial.service.js';
import { getPermission } from '../services/permiso.service.js';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { tienePermisoRuta } from '../utils/RouteAccess.js';
import { useNavigate } from 'react-router-dom';
import { ListControls } from '../ListControls.jsx';
import AutocompleteSelect from '../AutocompleteSelect.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const GrupoProductoApp = ({ userLog }) => {

    const navigate = useNavigate();
    const [grupoproductos, setGrupoProductos] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [tributaciones, setTributaciones] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [grupoproductoAGuardar, setGrupoProductoAGuardar] = useState(null);
    const [grupoproductoAEliminar, setGrupoProductoAEliminar] = useState(null);
    const [grupoproductoNoEliminar, setGrupoProductoNoEliminar] = useState(null);
    const [grupoproductoAVisualizar, setGrupoProductoAVisualizar] = useState(null);
    const [grupoproductoErp, setGrupoProductoErp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filtroActivo, setFiltroActivo] = useState({ visible: false });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});
    const [query, setQuery] = useState({
        page: 0,
        size: 10,
        order: "",
        filter: []
    });

    const [puedeCrearTributacion, setPuedeCrearTributacion] = useState(false);
    const [puedeCrearMoneda, setPuedeCrearMoneda] = useState(false);

    useEffect(() => {
        const loadPermiso = async () => {
            const ok1 = await tienePermisoRuta(['gr04'], userLog?.tipousuario?.id);
            setPuedeCrearTributacion(ok1);
            const ok2 = await tienePermisoRuta(['gr02'], userLog?.tipousuario?.id);
            setPuedeCrearMoneda(ok2);
        };

        if (userLog?.tipousuario?.id) {
            loadPermiso();
        }
    }, [userLog]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setGrupoProductoAEliminar(null);
                setGrupoProductoNoEliminar(null);
                setGrupoProductoAVisualizar(null);
                setGrupoProductoAGuardar(null);
                setGrupoProductoErp(null);
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
        tributacion: null,
        moneda: null,
        grupoproducto: "",
        erpid: 0,
        subgrupoproducto: []
    };

    const recuperarGrupoProductos = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarTributaciones = async () => {
        const response = await getTaxation();
        setTributaciones(response.items);
    }

    const recuperarMonedas = async () => {
        const response = await getCurrency();
        setMonedas(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:pr01`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getProductGroup(query.page, query.size, query.order, filtrosFinal);
            setGrupoProductos(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            recuperarTributaciones();
            recuperarMonedas();
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarGrupoProductoFn = async (id) => {
        setLoading(true);
        await deleteProductGroup(id);
        await AddAccess('Eliminar', id, userLog, "Grupos de Productos");
        recuperarGrupoProductos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarGrupoProductoFn(id);
        setGrupoProductoAEliminar(null);
    }

    const handleEliminarGrupoProducto = async (grupoproducto) => {
        const rel = await getCommercial('', '', '', `subgrupoproducto.grupoproducto.id:eq:${grupoproducto.id}`);
        if (rel.items.length > 0) setGrupoProductoNoEliminar(grupoproducto);
        else setGrupoProductoAEliminar(grupoproducto);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setGrupoProductoErp(null);
        await updateErpProductGroup();
        recuperarGrupoProductos();
        setLoading(false);
    }

    const guardarFn = async (grupoproductoAGuardar) => {
        setGrupoProductoAGuardar(null);
        setLoading(true);

        if (grupoproductoAGuardar.id) {
            await updateProductGroup(grupoproductoAGuardar.id, grupoproductoAGuardar);
            await AddAccess('Modificar', grupoproductoAGuardar.id, userLog, "Grupos de Productos");
        } else {
            const nuevoGrupoProducto = await saveProductGroup(grupoproductoAGuardar);
            await AddAccess('Insertar', nuevoGrupoProducto.saved.id, userLog, "Grupos de Productos");
        }
        recuperarGrupoProductos();
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

        let sw = 0;
        if (!grupoproductoAGuardar.grupoproducto || !grupoproductoAGuardar.moneda) sw = 1;

        if (sw === 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...grupoproductoAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const rows = [...grupoproductos];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {grupoproductoErp && (
                <ImportErp setErp={setGrupoProductoErp} title={'grupos de productos'} fun={importarDatosERP} />
            )}
            {grupoproductoAEliminar && (
                <Delete setEliminar={setGrupoProductoAEliminar} title={'grupo de producto'} gen={true} confirmar={confirmarEliminacion} id={grupoproductoAEliminar.id} />
            )}
            {grupoproductoNoEliminar && (
                <NotDelete setNoEliminar={setGrupoProductoNoEliminar} title={'grupo de producto'} gen={true} />
            )}

            {grupoproductoAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <label htmlFor="grupoproducto" className="form-label m-0 mb-2">Descripción</label>
                                        <input
                                            type="text"
                                            id="grupoproducto"
                                            name="grupoproducto"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={grupoproductoAVisualizar.grupoproducto || ''}
                                            readOnly
                                        />
                                        <label htmlFor="tributacion" className="form-label m-0 mb-2">Tributación</label>
                                        <input
                                            type="text"
                                            id="tributacion"
                                            name="tributacion"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={grupoproductoAVisualizar.tributacion?.tributacion || ''}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <label htmlFor="moneda" className="form-label m-0 mb-2">Moneda</label>
                                        <input
                                            type="text"
                                            id="moneda"
                                            name="moneda"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={grupoproductoAVisualizar.moneda?.moneda || ''}
                                            readOnly
                                        />
                                        <div hidden={!userLog?.id == 1}>
                                            <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                            <input
                                                type="number"
                                                id="erpid"
                                                name="erpid"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={grupoproductoAVisualizar.erpid || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setGrupoProductoAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {grupoproductoAGuardar && (
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
                                                <label htmlFor="grupoproducto" className="form-label m-0 mb-2">Descripción</label>
                                                <input
                                                    type="text"
                                                    id="grupoproducto"
                                                    name="grupoproducto"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={grupoproductoAGuardar.grupoproducto || ''}
                                                    onChange={(event) => setGrupoProductoAGuardar({ ...grupoproductoAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    autoFocus
                                                    maxLength={150}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La descripción es obligatoria y no debe sobrepasar los 150 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="tributacion" className="form-label m-0 mb-2">Tributacion</label>
                                                <i style={{ cursor: puedeCrearTributacion ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearTributacion ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearTributacion) {
                                                            await AddAccess('Consultar', 0, userLog, 'Tributaciones')
                                                            navigate('/home/config/general/taxations')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={tributaciones}
                                                    value={grupoproductoAGuardar.tributacion}
                                                    getLabel={(v) => v.tributacion}
                                                    searchFields={[
                                                        v => v.tributacion
                                                    ]}
                                                    onChange={(v) =>
                                                        setGrupoProductoAGuardar({
                                                            ...grupoproductoAGuardar,
                                                            tributacion: v
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="moneda" className="form-label m-0 mb-2">Moneda</label>
                                                <i style={{ cursor: puedeCrearMoneda ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearMoneda ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearMoneda) {
                                                            await AddAccess('Consultar', 0, userLog, 'Monedas')
                                                            navigate('/home/config/general/currencies')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={monedas}
                                                    value={grupoproductoAGuardar.moneda}
                                                    getLabel={(v) => v.moneda}
                                                    searchFields={[
                                                        v => v.moneda
                                                    ]}
                                                    onChange={(v) =>
                                                        setGrupoProductoAGuardar({
                                                            ...grupoproductoAGuardar,
                                                            moneda: v
                                                        })
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                            <div className='form-group mb-1' hidden={!userLog?.id == 1}>
                                                <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                                <input
                                                    type="number"
                                                    id="erpid"
                                                    name="erpid"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={grupoproductoAGuardar.erpid || ''}
                                                    onChange={(event) => setGrupoProductoAGuardar({ ...grupoproductoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setGrupoProductoAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <Header userLog={userLog} title={'GRUPOS DE PRODUCTOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Grupos de Productos
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
                                        <th onClick={() => toggleOrder("grupoproducto")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("grupoproducto")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["grupoproducto"] ?? {};
                                                    setFiltroActivo({
                                                        field: "grupoproducto",
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
                                        <th onClick={() => toggleOrder("moneda.moneda")} className="sortable-header">
                                            Moneda
                                            <i className={`bi ${getSortIcon("moneda.moneda")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["moneda.moneda"] ?? {};
                                                    setFiltroActivo({
                                                        field: "moneda.moneda",
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
                                        <th onClick={() => toggleOrder("tributacion.tributacion")} className="sortable-header">
                                            Tributación
                                            <i className={`bi ${getSortIcon("tributacion.tributacion")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["tributacion.tributacion"] ?? {};
                                                    setFiltroActivo({
                                                        field: "tributacion.tributacion",
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
                                    {grupoproductos.length === 0 ? (
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
                                                        if (puedeEditar) setGrupoProductoAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.grupoproducto}</td>
                                                    <td>{v.moneda?.moneda}</td>
                                                    <td>{v.tributacion?.tributacion}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarGrupoProducto(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "GrupoProductos");
                                                                    setGrupoProductoAVisualizar(v);
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
                            onAdd={() => setGrupoProductoAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setGrupoProductoErp(true)}
                            canAdd={permiso?.puedeagregar}
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
