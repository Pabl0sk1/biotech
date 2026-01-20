import { useState, useEffect } from 'react';
import { getProduct, saveProduct, updateProduct, deleteProduct, updateErpProduct } from '../services/producto.service.js';
import { getEntity } from '../services/entidad.service.js';
import { getCommercial } from '../services/nombrecomercial.service.js';
import { getAsset } from '../services/principioactivo.service.js';
import { getCrop } from '../services/fasecultivo.service.js';
import { getProductType } from '../services/tipoproducto.service.js';
import { getPermission } from '../services/permiso.service.js';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { tienePermisoRuta } from '../utils/RouteAccess.js';
import { obtenerClaseEstadoReg } from '../utils/StatusBadge.js';
import { useNavigate } from 'react-router-dom';
import { ListControls } from '../ListControls.jsx';
import AutocompleteSelect from '../AutocompleteSelect.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const ProductoApp = ({ userLog }) => {

    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [nombrecomerciales, setNombreComerciales] = useState([]);
    const [principioactivos, setPrincipioActivos] = useState([]);
    const [fasecultivos, setFaseCultivos] = useState([]);
    const [clases, setClases] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [productoAGuardar, setProductoAGuardar] = useState(null);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [productoNoEliminar, setProductoNoEliminar] = useState(null);
    const [productoAVisualizar, setProductoAVisualizar] = useState(null);
    const [productoErp, setProductoErp] = useState(null);
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
    const [puedeCrearNombreComercial, setPuedeCrearNombreComercial] = useState(false);
    const [puedeCrearPrincipioActivo, setPuedeCrearPrincipioActivo] = useState(false);
    const [puedeCrearFaseCultivo, setPuedeCrearFaseCultivo] = useState(false);
    const [puedeCrearClase, setPuedeCrearClase] = useState(false);

    useEffect(() => {
        const loadPermiso = async () => {
            const ok1 = await tienePermisoRuta(['ca01'], userLog?.tipousuario?.id);
            setPuedeCrearEntidad(ok1);
            const ok2 = await tienePermisoRuta(['cm02'], userLog?.tipousuario?.id);
            setPuedeCrearNombreComercial(ok2);
            const ok3 = await tienePermisoRuta(['pr03'], userLog?.tipousuario?.id);
            setPuedeCrearPrincipioActivo(ok3);
            const ok4 = await tienePermisoRuta(['gr01'], userLog?.tipousuario?.id);
            setPuedeCrearFaseCultivo(ok4);
            const ok5 = await tienePermisoRuta(['pr04'], userLog?.tipousuario?.id);
            setPuedeCrearClase(ok5);
        };

        if (userLog?.tipousuario?.id) {
            loadPermiso();
        }
    }, [userLog]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setProductoAEliminar(null);
                setProductoNoEliminar(null);
                setProductoAVisualizar(null);
                setProductoAGuardar(null);
                setProductoErp(null);
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
        entidad: null,
        nombrecomercial: null,
        principioactivo: null,
        fasecultivo: null,
        tipoproducto: null,
        dosisporhec: 0,
        estado: "Activo",
        activo: true,
        obs: "",
        erpid: 0
    };

    const recuperarProductos = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarEntidades = async () => {
        const response = await getEntity();
        setEntidades(response.items);
    }

    const recuperarNombreComerciales = async () => {
        const response = await getCommercial();
        setNombreComerciales(response.items);
    }

    const recuperarPrincipioActivos = async () => {
        const response = await getAsset();
        setPrincipioActivos(response.items);
    }

    const recuperarFaseCultivos = async () => {
        const response = await getCrop();
        setFaseCultivos(response.items);
    }

    const recuperarClases = async () => {
        const response = await getProductType();
        setClases(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:ca02`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getProduct(query.page, query.size, query.order, filtrosFinal);
            setProductos(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            recuperarEntidades();
            recuperarNombreComerciales();
            recuperarPrincipioActivos();
            recuperarFaseCultivos();
            recuperarClases();
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarProductoFn = async (id) => {
        setLoading(true);
        await deleteProduct(id);
        await AddAccess('Eliminar', id, userLog, "Productos");
        recuperarProductos();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarProductoFn(id);
        setProductoAEliminar(null);
    }

    const handleEliminarProducto = async (producto) => {
        // const rel = await getProduct('', '', '', `:eq:${producto.id}`);
        // if (rel.items.length > 0) setProductoNoEliminar(producto);
        setProductoAEliminar(producto);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setProductoErp(null);
        await updateErpProduct();
        recuperarProductos();
        setLoading(false);
    }

    const guardarFn = async (productoAGuardar) => {
        setProductoAGuardar(null);
        setLoading(true);

        let activo = true;
        if (productoAGuardar.estado == 'Inactivo') activo = false;

        const productoActualizado = {
            ...productoAGuardar,
            activo: activo
        };

        if (productoActualizado.id) {
            await updateProduct(productoActualizado.id, productoActualizado);
            await AddAccess('Modificar', productoActualizado.id, userLog, "Productos");
        } else {
            const nuevoProducto = await saveProduct(productoActualizado);
            await AddAccess('Insertar', nuevoProducto.saved.id, userLog, "Productos");
        }
        recuperarProductos();
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
        if (!productoAGuardar.nombrecomercial || !productoAGuardar.tipoproducto) sw = 1;

        if (sw === 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...productoAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const rows = [...productos];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {productoErp && (
                <ImportErp setErp={setProductoErp} title={'productos'} fun={importarDatosERP} />
            )}
            {productoAEliminar && (
                <Delete setEliminar={setProductoAEliminar} title={'producto'} gen={true} confirmar={confirmarEliminacion} id={productoAEliminar.id} />
            )}
            {productoNoEliminar && (
                <NotDelete setNoEliminar={setProductoNoEliminar} title={'producto'} gen={true} />
            )}

            {productoAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <label htmlFor="nombrecomercial" className="form-label m-0 mb-2">Descripción</label>
                                        <input
                                            type="text"
                                            id="nombrecomercial"
                                            name="nombrecomercial"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={productoAVisualizar.nombrecomercial?.nombrecomercial || ''}
                                            readOnly
                                        />
                                        <label htmlFor="fasecultivo" className="form-label m-0 mb-2">Fase de Cultivo</label>
                                        <input
                                            type="text"
                                            id="fasecultivo"
                                            name="fasecultivo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={productoAVisualizar.fasecultivo?.fasecultivo || ''}
                                            readOnly
                                        />
                                        <label htmlFor="entidad" className="form-label m-0 mb-2">Entidad</label>
                                        <input
                                            type="text"
                                            id="entidad"
                                            name="entidad"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={productoAVisualizar.entidad?.nomape || ''}
                                            readOnly
                                        />
                                        <label htmlFor="estado" className="form-label m-0 mb-2">Estado</label>
                                        <input
                                            type="text"
                                            id="estado"
                                            name="estado"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={productoAVisualizar.estado || ''}
                                            readOnly
                                        />
                                        <div hidden={!userLog?.id == 1}>
                                            <label htmlFor="costogerencial" className="form-label m-0 mb-2">Costo Gerencial</label>
                                            <input
                                                type="number"
                                                id="costogerencial"
                                                name="costogerencial"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={productoAVisualizar.costogerencial || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div hidden={!userLog?.id == 1}>
                                            <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                            <input
                                                type="number"
                                                id="erpid"
                                                name="erpid"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={productoAVisualizar.erpid || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0 pe-0 me-5'>
                                        <label htmlFor="principioactivo" className="form-label m-0 mb-2">Principio Activo</label>
                                        <input
                                            type="text"
                                            id="principioactivo"
                                            name="principioactivo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={productoAVisualizar.principioactivo?.principioactivo || ''}
                                            readOnly
                                        />
                                        <label htmlFor="clase" className="form-label m-0 mb-2">Clase</label>
                                        <input
                                            type="text"
                                            id="clase"
                                            name="clase"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={productoAVisualizar.tipoproducto?.tipoproducto || ''}
                                            readOnly
                                        />
                                        <label htmlFor="dosisporhec" className="form-label m-0 mb-2">Dosis p/h</label>
                                        <input
                                            type="number"
                                            id="dosisporhec"
                                            name="dosisporhec"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={productoAVisualizar.dosisporhec || ''}
                                            readOnly
                                        />
                                        <label htmlFor="precio" className="form-label m-0 mb-2">Precio</label>
                                        <input
                                            type="number"
                                            id="precio"
                                            name="precio"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={productoAVisualizar.precio || ''}
                                            readOnly
                                        />
                                        <label htmlFor="incluirplan" className="form-label m-0 mb-2 me-2 d-flex">Incluir Planeamiento</label>
                                        <input
                                            type="checkbox"
                                            id="incluirplan"
                                            name="incluirplan"
                                            className="form-check-input"
                                            style={{ width: '60px', height: '30px' }}
                                            checked={productoAVisualizar.incluirplan || ''}
                                            readOnly
                                        />
                                    </div>
                                    <div className='col ms-5 ps-0'>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="obs" className="form-label m-0 mb-2">Observación</label>
                                            <textarea
                                                id="obs"
                                                name="obs"
                                                className="form-control border-input w-100 border-black mb-3"
                                                style={{ resize: 'none', height: '295px' }}
                                                value={productoAVisualizar.obs || ''}
                                                readOnly>
                                            </textarea>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setProductoAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {productoAGuardar && (
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
                                                <label htmlFor="nombrecomercial" className="form-label m-0 mb-2">Nombre Comercial</label>
                                                <i style={{ cursor: puedeCrearNombreComercial ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearNombreComercial ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearNombreComercial) {
                                                            await AddAccess('Consultar', 0, userLog, 'Nombres Comerciales')
                                                            navigate('/home/config/commercial/tradenames')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={nombrecomerciales}
                                                    value={productoAGuardar.nombrecomercial}
                                                    getLabel={(v) => v.nombrecomercial}
                                                    searchFields={[
                                                        v => v.nombrecomercial
                                                    ]}
                                                    onChange={(v) =>
                                                        setProductoAGuardar({
                                                            ...productoAGuardar,
                                                            nombrecomercial: v
                                                        })
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="fasecultivo" className="form-label m-0 mb-2">Fase de Cultivo</label>
                                                <i style={{ cursor: puedeCrearFaseCultivo ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearFaseCultivo ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearFaseCultivo) {
                                                            await AddAccess('Consultar', 0, userLog, 'Fases de Cultivos')
                                                            navigate('/home/config/general/crops')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={fasecultivos}
                                                    value={productoAGuardar.fasecultivo}
                                                    getLabel={(v) => v.fasecultivo}
                                                    searchFields={[
                                                        v => v.fasecultivo
                                                    ]}
                                                    onChange={(v) =>
                                                        setProductoAGuardar({
                                                            ...productoAGuardar,
                                                            fasecultivo: v
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="entidad" className="form-label m-0 mb-2">Entidad</label>
                                                <i style={{ cursor: puedeCrearEntidad ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearEntidad ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearEntidad) {
                                                            await AddAccess('Consultar', 0, userLog, 'Entidades')
                                                            navigate('/home/cadastres/entities')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={entidades}
                                                    value={productoAGuardar.entidad}
                                                    getLabel={(v) => v.nomape}
                                                    searchFields={[
                                                        v => v.nomape,
                                                        v => v.nrodoc
                                                    ]}
                                                    onChange={(v) =>
                                                        setProductoAGuardar({
                                                            ...productoAGuardar,
                                                            entidad: v
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
                                                    value={productoAGuardar.estado ? productoAGuardar.estado : ''}
                                                    onChange={(event) => setProductoAGuardar({ ...productoAGuardar, [event.target.name]: event.target.value })}
                                                    disabled={!productoAGuardar.id}
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
                                                <label htmlFor="costogerencial" className="form-label m-0 mb-2">Costo Gerencial</label>
                                                <input
                                                    type="number"
                                                    id="costogerencial"
                                                    name="costogerencial"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={productoAGuardar.costogerencial || ''}
                                                    onChange={(event) => setProductoAGuardar({ ...productoAGuardar, [event.target.name]: event.target.value })}
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
                                                    value={productoAGuardar.erpid || ''}
                                                    onChange={(event) => setProductoAGuardar({ ...productoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0 pe-0 me-5'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="principioactivo" className="form-label m-0 mb-2">Principio Activo</label>
                                                <i style={{ cursor: puedeCrearPrincipioActivo ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearPrincipioActivo ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearPrincipioActivo) {
                                                            await AddAccess('Consultar', 0, userLog, 'Principios Activos')
                                                            navigate('/home/config/product/assets')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={principioactivos}
                                                    value={productoAGuardar.principioactivo}
                                                    getLabel={(v) => v.principioactivo}
                                                    searchFields={[
                                                        v => v.principioactivo
                                                    ]}
                                                    onChange={(v) =>
                                                        setProductoAGuardar({
                                                            ...productoAGuardar,
                                                            principioactivo: v
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="clase" className="form-label m-0 mb-2">Clase</label>
                                                <i style={{ cursor: puedeCrearClase ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearClase ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearClase) {
                                                            await AddAccess('Consultar', 0, userLog, 'Clases')
                                                            navigate('/home/config/product/classes')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={clases}
                                                    value={productoAGuardar.tipoproducto}
                                                    getLabel={(v) => v.tipoproducto}
                                                    searchFields={[
                                                        v => v.tipoproducto
                                                    ]}
                                                    onChange={(v) =>
                                                        setProductoAGuardar({
                                                            ...productoAGuardar,
                                                            tipoproducto: v
                                                        })
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="dosisporhec" className="form-label m-0 mb-2">Dosis p/h</label>
                                                <input
                                                    type="number"
                                                    id="dosisporhec"
                                                    name="dosisporhec"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={productoAGuardar.dosisporhec || ''}
                                                    onChange={(event) => setProductoAGuardar({ ...productoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="precio" className="form-label m-0 mb-2">Precio</label>
                                                <input
                                                    type="number"
                                                    id="precio"
                                                    name="precio"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={productoAGuardar.precio || ''}
                                                    onChange={(event) => setProductoAGuardar({ ...productoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="incluirplan" className="form-label m-0 mb-2 me-2 d-flex">Incluir Planeamiento</label>
                                                <input
                                                    type="checkbox"
                                                    id="incluirplan"
                                                    name="incluirplan"
                                                    className="form-check-input"
                                                    style={{ width: '60px', height: '30px' }}
                                                    checked={productoAGuardar.incluirplan || ''}
                                                    onChange={(e) => {
                                                        const check = e.target.checked;
                                                        setProductoAGuardar({ ...productoAGuardar, [e.target.name]: check });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 3 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="obs" className="form-label m-0 mb-2">Observación</label>
                                                <textarea
                                                    id="obs"
                                                    name="obs"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    style={{ resize: 'none', height: '260px' }}
                                                    value={productoAGuardar.obs || ''}
                                                    onChange={(event) => setProductoAGuardar({ ...productoAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={150}>
                                                </textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setProductoAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <Header userLog={userLog} title={'PRODUCTOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Productos
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
                                        <th onClick={() => toggleOrder("nombrecomercial.subgrupoproducto.grupoproductotxt")} className="sortable-header">
                                            Grupo
                                            <i className={`bi ${getSortIcon("nombrecomercial.subgrupoproducto.grupoproductotxt")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombrecomercial.subgrupoproducto.grupoproductotxt"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombrecomercial.subgrupoproducto.grupoproductotxt",
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
                                        <th onClick={() => toggleOrder("nombrecomercial.subgrupoproducto.subgrupoproducto")} className="sortable-header">
                                            Subgrupo
                                            <i className={`bi ${getSortIcon("nombrecomercial.subgrupoproducto.subgrupoproducto")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombrecomercial.subgrupoproducto.subgrupoproducto"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombrecomercial.subgrupoproducto.subgrupoproducto",
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
                                        <th onClick={() => toggleOrder("nombrecomercial.nombrecomercial")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("nombrecomercial.nombrecomercial")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombrecomercial.nombrecomercial"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombrecomercial.nombrecomercial",
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
                                        <th onClick={() => toggleOrder("tipoproducto.tipoproducto")} className="sortable-header">
                                            Clase
                                            <i className={`bi ${getSortIcon("tipoproducto.tipoproducto")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["tipoproducto.tipoproducto"] ?? {};
                                                    setFiltroActivo({
                                                        field: "tipoproducto.tipoproducto",
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
                                    {productos.length === 0 ? (
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
                                                        if (puedeEditar) setProductoAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.nombrecomercial?.subgrupoproducto?.grupoproductotxt}</td>
                                                    <td className='text-start'>{v.nombrecomercial?.subgrupoproducto?.subgrupoproducto}</td>
                                                    <td className='text-start'>{v.nombrecomercial?.nombrecomercial}</td>
                                                    <td>{v.tipoproducto?.tipoproducto}</td>
                                                    <td style={{ width: '140px' }}>
                                                        <p className={`text-center mx-auto w-75 ${obtenerClaseEstadoReg(v.activo)} m-0 rounded-2 border border-black`}>
                                                            {v.estado}
                                                        </p>
                                                    </td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarProducto(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Productos");
                                                                    setProductoAVisualizar(v);
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
                            onAdd={() => setProductoAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setProductoErp(true)}
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
