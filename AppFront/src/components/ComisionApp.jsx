import { useState, useEffect } from 'react';
import { getCommission, saveCommission, updateCommission, deleteCommission, updateErpCommission } from '../services/comision.service.js';
import { getEntity } from '../services/entidad.service.js';
import { getProductGroup } from '../services/grupoproducto.service.js';
import { getProduct } from '../services/producto.service.js';
import { getHarvest } from '../services/zafra.service.js';
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

export const ComisionApp = ({ userLog }) => {

    const navigate = useNavigate();
    const [comisiones, setComisiones] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [subgrupos, setSubgrupos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [zafras, setZafras] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [comisionAGuardar, setComisionAGuardar] = useState(null);
    const [comisionAEliminar, setComisionAEliminar] = useState(null);
    const [comisionNoEliminar, setComisionNoEliminar] = useState(null);
    const [comisionAVisualizar, setComisionAVisualizar] = useState(null);
    const [comisionErp, setComisionErp] = useState(null);
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
    const [puedeCrearGrupo, setPuedeCrearGrupo] = useState(false);
    const [puedeCrearProducto, setPuedeCrearProducto] = useState(false);

    useEffect(() => {
        const loadPermiso = async () => {
            const ok1 = await tienePermisoRuta(['ca01'], userLog?.tipousuario?.id);
            setPuedeCrearEntidad(ok1);
            const ok2 = await tienePermisoRuta(['pr01'], userLog?.tipousuario?.id);
            setPuedeCrearGrupo(ok2);
            const ok3 = await tienePermisoRuta(['ca02'], userLog?.tipousuario?.id);
            setPuedeCrearProducto(ok3);
        };

        if (userLog?.tipousuario?.id) {
            loadPermiso();
        }
    }, [userLog]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setComisionAEliminar(null);
                setComisionNoEliminar(null);
                setComisionAVisualizar(null);
                setComisionAGuardar(null);
                setComisionErp(null);
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
        grupoproducto: null,
        subgrupoproducto: null,
        producto: null,
        basecalculo: "",
        porcentaje: 0,
        erpid: 0,
        zafras: []
    };

    const recuperarComisiones = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarEntidades = async () => {
        const response = await getEntity();
        setEntidades(response.items);
    }

    const recuperarGrupos = async () => {
        const response = await getProductGroup();
        setGrupos(response.items);
    }

    const recuperarSubgrupos = async () => {
        const response = await getProductGroup('', '', '', '', 'subgroups');
        setSubgrupos(response.items);
    }

    const recuperarProductos = async () => {
        const response = await getProduct();
        setProductos(response.items);
    }

    const recuperarZafras = async () => {
        const response = await getHarvest();
        setZafras(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:cm04`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getCommission(query.page, query.size, query.order, filtrosFinal);
            setComisiones(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarEntidades();
        recuperarGrupos();
        recuperarSubgrupos();
        recuperarProductos();
        recuperarZafras();
    }, []);

    const eliminarComisionFn = async (id) => {
        setLoading(true);
        await deleteCommission(id);
        await AddAccess('Eliminar', id, userLog, "Comisiones");
        recuperarComisiones();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarComisionFn(id);
        setComisionAEliminar(null);
    }

    const handleEliminarComision = async (comision) => {
        // const rel = await getCommission('', '', '', `:eq:${comision.id}`);
        // if (rel.items.length > 0) setComisionNoEliminar(comision);
        setComisionAEliminar(comision);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setComisionErp(null);
        await updateErpCommission();
        recuperarComisiones();
        setLoading(false);
    }

    const guardarFn = async (comisionAGuardar) => {
        setComisionAGuardar(null);
        setLoading(true);

        if (comisionAGuardar.id) {
            await updateCommission(comisionAGuardar.id, comisionAGuardar);
            await AddAccess('Modificar', comisionAGuardar.id, userLog, "Comisiones");
        } else {
            const nuevoComision = await saveCommission(comisionAGuardar);
            await AddAccess('Insertar', nuevoComision.saved.id, userLog, "Comisiones");
        }
        recuperarComisiones();
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
        if (!comisionAGuardar.entidad || !comisionAGuardar.entidad) sw = 1;
        if (!comisionAGuardar.basecalculo) sw = 1;

        if (sw === 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...comisionAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const rows = [...comisiones];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {comisionErp && (
                <ImportErp setErp={setComisionErp} title={'comisiones'} fun={importarDatosERP} />
            )}
            {comisionAEliminar && (
                <Delete setEliminar={setComisionAEliminar} title={'comision'} gen={true} confirmar={confirmarEliminacion} id={comisionAEliminar.id} />
            )}
            {comisionNoEliminar && (
                <NotDelete setNoEliminar={setComisionNoEliminar} title={'comision'} gen={true} />
            )}

            {comisionAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <label htmlFor="entidad" className="form-label m-0 mb-2">Entidad</label>
                                        <input
                                            type="text"
                                            id="entidad"
                                            name="entidad"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={comisionAVisualizar.entidad?.nomape || ''}
                                            readOnly
                                        />
                                        <label htmlFor="grupo" className="form-label m-0 mb-2">Grupo de Producto</label>
                                        <input
                                            type="text"
                                            id="grupo"
                                            name="grupo"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={comisionAVisualizar.grupoproducto?.grupoproducto || ''}
                                            readOnly
                                        />
                                        <label htmlFor="basecalculo" className="form-label m-0 mb-2">Base de Cálculo</label>
                                        <input
                                            type="text"
                                            id="basecalculo"
                                            name="basecalculo"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={comisionAVisualizar.basecalculo || ''}
                                            readOnly
                                        />
                                        <div hidden={!userLog?.id == 1}>
                                            <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                            <input
                                                type="number"
                                                id="erpid"
                                                name="erpid"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={comisionAVisualizar.erpid || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <label htmlFor="producto" className="form-label m-0 mb-2">Producto</label>
                                        <input
                                            type="text"
                                            id="producto"
                                            name="producto"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={comisionAVisualizar.producto?.nombrecomercial?.nombrecomercial || ''}
                                            readOnly
                                        />
                                        <label htmlFor="subgrupo" className="form-label m-0 mb-2">Subgrupo de Producto</label>
                                        <input
                                            type="text"
                                            id="subgrupo"
                                            name="subgrupo"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={comisionAVisualizar.subgrupoproducto?.subgrupoproducto || ''}
                                            readOnly
                                        />
                                        <label htmlFor="porcentaje" className="form-label m-0 mb-2">Porcentaje</label>
                                        <input
                                            type="number"
                                            id="porcentaje"
                                            name="porcentaje"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={comisionAVisualizar.porcentaje || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setComisionAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {comisionAGuardar && (
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
                                                    value={comisionAGuardar.entidad}
                                                    getLabel={(v) => v.nomape}
                                                    searchFields={[
                                                        v => v.nomape,
                                                        v => v.nrodoc
                                                    ]}
                                                    onChange={(v) =>
                                                        setComisionAGuardar({
                                                            ...comisionAGuardar,
                                                            entidad: v
                                                        })
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="fasecultivo" className="form-label m-0 mb-2">Grupo de Producto</label>
                                                <i style={{ cursor: puedeCrearGrupo ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearGrupo ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearGrupo) {
                                                            await AddAccess('Consultar', 0, userLog, 'Grupos de Productos')
                                                            navigate('/home/config/product/productgroups')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={grupos}
                                                    value={comisionAGuardar.grupoproducto}
                                                    getLabel={(v) => v.grupoproducto}
                                                    searchFields={[
                                                        v => v.grupoproducto
                                                    ]}
                                                    onChange={(v) =>
                                                        setComisionAGuardar({
                                                            ...comisionAGuardar,
                                                            grupoproducto: v
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="basecalculo" className="form-label m-0 mb-2">Base de Cálculo</label>
                                                <select
                                                    className="form-select modern-input w-100"
                                                    name="basecalculo"
                                                    id='basecalculo'
                                                    value={comisionAGuardar.basecalculo ? comisionAGuardar.basecalculo : ''}
                                                    onChange={(event) => setComisionAGuardar({ ...comisionAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione una base...</option>
                                                    <option key={1} value={'Precio'}>Precio</option>
                                                    <option key={2} value={'Rentabilidad'}>Rentabilidad</option>
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La base de cálculo es obligatoria.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1' hidden={!userLog?.id == 1}>
                                                <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                                <input
                                                    type="number"
                                                    id="erpid"
                                                    name="erpid"
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={comisionAGuardar.erpid || ''}
                                                    onChange={(event) => setComisionAGuardar({ ...comisionAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="producto" className="form-label m-0 mb-2">Producto</label>
                                                <i style={{ cursor: puedeCrearProducto ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearProducto ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearProducto) {
                                                            await AddAccess('Consultar', 0, userLog, 'Principios Activos')
                                                            navigate('/home/config/product/assets')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={productos}
                                                    value={comisionAGuardar.producto}
                                                    getLabel={(v) => v.nombrecomercial.nombrecomercial}
                                                    searchFields={[
                                                        v => v.nombrecomercial.nombrecomercial
                                                    ]}
                                                    onChange={(v) =>
                                                        setComisionAGuardar({
                                                            ...comisionAGuardar,
                                                            producto: v
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="subgrupo" className="form-label m-0 mb-2">Subgrupo de Producto</label>
                                                <i style={{ cursor: puedeCrearGrupo ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearGrupo ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearGrupo) {
                                                            await AddAccess('Consultar', 0, userLog, 'Grupos de Productos')
                                                            navigate('/home/config/product/productgroups')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={subgrupos}
                                                    value={comisionAGuardar.subgrupoproducto}
                                                    getLabel={(v) => v.subgrupoproducto}
                                                    searchFields={[
                                                        v => v.subgrupoproducto
                                                    ]}
                                                    onChange={(v) =>
                                                        setComisionAGuardar({
                                                            ...comisionAGuardar,
                                                            subgrupoproducto: v
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="porcentaje" className="form-label m-0 mb-2">Porcentaje</label>
                                                <input
                                                    type="number"
                                                    id="porcentaje"
                                                    name="porcentaje"
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={comisionAGuardar.porcentaje || ''}
                                                    onChange={(event) => setComisionAGuardar({ ...comisionAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setComisionAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <Header userLog={userLog} title={'COMISIONES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Comisiones
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
                                        <th onClick={() => toggleOrder("entidad.nomape")} className="sortable-header">
                                            Entidad
                                            <i className={`bi ${getSortIcon("entidad.nomape")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["entidad.nomape"] ?? {};
                                                    setFiltroActivo({
                                                        field: "entidad.nomape",
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
                                        <th onClick={() => toggleOrder("basecalculo")} className="sortable-header">
                                            Base
                                            <i className={`bi ${getSortIcon("basecalculo")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["basecalculo"] ?? {};
                                                    setFiltroActivo({
                                                        field: "basecalculo",
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
                                        <th onClick={() => toggleOrder("porcentaje")} className="sortable-header">
                                            Porcentaje
                                            <i className={`bi ${getSortIcon("porcentaje")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["porcentaje"] ?? {};
                                                    setFiltroActivo({
                                                        field: "porcentaje",
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
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comisiones.length === 0 ? (
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
                                                        if (puedeEditar) setComisionAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.entidad.nomape}</td>
                                                    <td className='text-start'>{v.basecalculo}</td>
                                                    <td className='text-start'>{v.porcentaje}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarComision(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Comisiones");
                                                                    setComisionAVisualizar(v);
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
                            onAdd={() => setComisionAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setComisionErp(true)}
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
