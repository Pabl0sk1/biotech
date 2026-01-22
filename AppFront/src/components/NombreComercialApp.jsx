import { useState, useEffect } from 'react';
import { getCommercial, saveCommercial, updateCommercial, deleteCommercial, updateErpCommercial } from '../services/nombrecomercial.service.js';
import { getMeasure } from '../services/medida.service.js';
import { getProductGroup } from '../services/grupoproducto.service.js';
import { getProduct } from '../services/producto.service.js';
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

export const NombreComercialApp = ({ userLog }) => {

    const navigate = useNavigate();
    const [nombrecomerciales, setNombreComerciales] = useState([]);
    const [medidas, setMedidas] = useState([]);
    const [subgrupos, setSubgrupos] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [nombrecomercialAGuardar, setNombreComercialAGuardar] = useState(null);
    const [nombrecomercialAEliminar, setNombreComercialAEliminar] = useState(null);
    const [nombrecomercialNoEliminar, setNombreComercialNoEliminar] = useState(null);
    const [nombrecomercialAVisualizar, setNombreComercialAVisualizar] = useState(null);
    const [nombrecomercialErp, setNombreComercialErp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filtroActivo, setFiltroActivo] = useState({ visible: false });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});
    const [query, setQuery] = useState({
        page: 0,
        size: 10,
        order: "",
        filter: []
    });

    const [puedeCrearSubgrupo, setPuedeCrearSubgrupo] = useState(false);
    const [puedeCrearMedida, setPuedeCrearMedida] = useState(false);

    useEffect(() => {
        const loadPermiso = async () => {
            const ok1 = await tienePermisoRuta(['pr01'], userLog?.tipousuario?.id);
            setPuedeCrearSubgrupo(ok1);
            const ok2 = await tienePermisoRuta(['pr02'], userLog?.tipousuario?.id);
            setPuedeCrearMedida(ok2);
        };

        if (userLog?.tipousuario?.id) {
            loadPermiso();
        }
    }, [userLog]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setNombreComercialAEliminar(null);
                setNombreComercialNoEliminar(null);
                setNombreComercialAVisualizar(null);
                setNombreComercialAGuardar(null);
                setNombreComercialErp(null);
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
        subgrupoproducto: null,
        medida: null,
        nombrecomercial: "",
        erpid: 0
    };

    const recuperarNombreComerciales = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarSubgrupos = async () => {
        const response = await getProductGroup('', '', '', '', 'subgroups');
        setSubgrupos(response.items);
    }

    const recuperarMedidas = async () => {
        const response = await getMeasure();
        setMedidas(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:cm02`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getCommercial(query.page, query.size, query.order, filtrosFinal);
            setNombreComerciales(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarSubgrupos();
        recuperarMedidas();
    }, []);

    const eliminarNombreComercialFn = async (id) => {
        setLoading(true);
        await deleteCommercial(id);
        await AddAccess('Eliminar', id, userLog, "Nombres Comerciales");
        recuperarNombreComerciales();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarNombreComercialFn(id);
        setNombreComercialAEliminar(null);
    }

    const handleEliminarNombreComercial = async (nombrecomercial) => {
        const rel = await getProduct('', '', '', `nombrecomercial.id:eq:${nombrecomercial.id}`);
        if (rel.items.length > 0) setNombreComercialNoEliminar(nombrecomercial);
        else setNombreComercialAEliminar(nombrecomercial);
    };

    const importarDatosERP = async () => {
        setLoading(true);
        setNombreComercialErp(null);
        await updateErpCommercial();
        recuperarNombreComerciales();
        setLoading(false);
    }

    const guardarFn = async (nombrecomercialAGuardar) => {
        setNombreComercialAGuardar(null);
        setLoading(true);

        if (nombrecomercialAGuardar.id) {
            await updateCommercial(nombrecomercialAGuardar.id, nombrecomercialAGuardar);
            await AddAccess('Modificar', nombrecomercialAGuardar.id, userLog, "Nombres Comerciales");
        } else {
            const nuevoNombreComercial = await saveCommercial(nombrecomercialAGuardar);
            await AddAccess('Insertar', nuevoNombreComercial.saved.id, userLog, "Nombres Comerciales");
        }
        recuperarNombreComerciales();
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
        if (!nombrecomercialAGuardar.nombrecomercial || !nombrecomercialAGuardar.medida || !nombrecomercialAGuardar.subgrupoproducto) sw = 1;

        if (sw === 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...nombrecomercialAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const rows = [...nombrecomerciales];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {nombrecomercialErp && (
                <ImportErp setErp={setNombreComercialErp} title={'nombres comerciales'} fun={importarDatosERP} />
            )}
            {nombrecomercialAEliminar && (
                <Delete setEliminar={setNombreComercialAEliminar} title={'nombre comercial'} gen={true} confirmar={confirmarEliminacion} id={nombrecomercialAEliminar.id} />
            )}
            {nombrecomercialNoEliminar && (
                <NotDelete setNoEliminar={setNombreComercialNoEliminar} title={'nombre comercial'} gen={true} />
            )}

            {nombrecomercialAVisualizar && (
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
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={nombrecomercialAVisualizar.nombrecomercial || ''}
                                            readOnly
                                        />
                                        <label htmlFor="subgrupo" className="form-label m-0 mb-2">Subgrupo de Producto</label>
                                        <input
                                            type="text"
                                            id="subgrupo"
                                            name="subgrupo"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={nombrecomercialAVisualizar.subgrupoproducto?.subgrupoproducto || ''}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <label htmlFor="medida" className="form-label m-0 mb-2">Medida</label>
                                        <input
                                            type="text"
                                            id="medida"
                                            name="medida"
                                            className="form-control modern-input w-100 border-black mb-3"
                                            value={nombrecomercialAVisualizar.medida?.medida || ''}
                                            readOnly
                                        />
                                        <div hidden={!userLog?.id == 1}>
                                            <label htmlFor="erpid" className="form-label m-0 mb-2">ERP ID</label>
                                            <input
                                                type="number"
                                                id="erpid"
                                                name="erpid"
                                                className="form-control modern-input w-100 border-black mb-3"
                                                value={nombrecomercialAVisualizar.erpid || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setNombreComercialAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {nombrecomercialAGuardar && (
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
                                                <label htmlFor="nombrecomercial" className="form-label m-0 mb-2">Descripción</label>
                                                <input
                                                    type="text"
                                                    id="nombrecomercial"
                                                    name="nombrecomercial"
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={nombrecomercialAGuardar.nombrecomercial || ''}
                                                    onChange={(event) => setNombreComercialAGuardar({ ...nombrecomercialAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    autoFocus
                                                    maxLength={150}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La descripción es obligatoria y no debe sobrepasar los 150 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="subgrupo" className="form-label m-0 mb-2">Subgrupo de Producto</label>
                                                <i style={{ cursor: puedeCrearSubgrupo ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearSubgrupo ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearSubgrupo) {
                                                            await AddAccess('Consultar', 0, userLog, 'Grupos de Productos')
                                                            navigate('/home/config/product/productgroups')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={subgrupos}
                                                    value={nombrecomercialAGuardar.subgrupoproducto}
                                                    getLabel={(v) => v.subgrupoproducto}
                                                    searchFields={[
                                                        v => v.subgrupoproducto
                                                    ]}
                                                    onChange={(v) =>
                                                        setNombreComercialAGuardar({
                                                            ...nombrecomercialAGuardar,
                                                            subgrupoproducto: v
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="medida" className="form-label m-0 mb-2">Medida</label>
                                                <i style={{ cursor: puedeCrearMedida ? "pointer" : '' }}
                                                    className={`bi bi-plus-circle-fill ms-2 ${puedeCrearMedida ? 'text-success' : 'text-success-emphasis'}`}
                                                    onClick={async () => {
                                                        if (puedeCrearMedida) {
                                                            await AddAccess('Consultar', 0, userLog, 'Medidas')
                                                            navigate('/home/config/product/measures')
                                                        };
                                                    }}>
                                                </i>
                                                <AutocompleteSelect
                                                    options={medidas}
                                                    value={nombrecomercialAGuardar.medida}
                                                    getLabel={(v) => v.medida}
                                                    searchFields={[
                                                        v => v.medida
                                                    ]}
                                                    onChange={(v) =>
                                                        setNombreComercialAGuardar({
                                                            ...nombrecomercialAGuardar,
                                                            medida: v
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
                                                    className="form-control modern-input w-100"
                                                    placeholder="Escribe..."
                                                    value={nombrecomercialAGuardar.erpid || ''}
                                                    onChange={(event) => setNombreComercialAGuardar({ ...nombrecomercialAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setNombreComercialAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <Header userLog={userLog} title={'NOMBRES COMERCIALES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Nombres de Comerciales
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
                                        <th onClick={() => toggleOrder("nombrecomercial")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("nombrecomercial")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nombrecomercial"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nombrecomercial",
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
                                        <th onClick={() => toggleOrder("subgrupoproducto.subgrupoproducto")} className="sortable-header">
                                            Subgrupo de Producto
                                            <i className={`bi ${getSortIcon("subgrupoproducto.subgrupoproducto")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["subgrupoproducto.subgrupoproducto"] ?? {};
                                                    setFiltroActivo({
                                                        field: "subgrupoproducto.subgrupoproducto",
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
                                        <th onClick={() => toggleOrder("medida.medida")} className="sortable-header">
                                            Medida
                                            <i className={`bi ${getSortIcon("medida.medida")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["medida.medida"] ?? {};
                                                    setFiltroActivo({
                                                        field: "medida.medida",
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
                                    {nombrecomerciales.length === 0 ? (
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
                                                        if (puedeEditar) setNombreComercialAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.nombrecomercial}</td>
                                                    <td>{v.subgrupoproducto?.subgrupoproducto}</td>
                                                    <td>{v.medida?.medida}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarNombreComercial(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "NombreComerciales");
                                                                    setNombreComercialAVisualizar(v);
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
                            onAdd={() => setNombreComercialAGuardar(selected)}
                            onRefresh={refrescar}
                            onErpImport={() => setNombreComercialErp(true)}
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
