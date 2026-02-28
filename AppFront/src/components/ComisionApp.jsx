import { useState, useEffect } from 'react';
import { getCommission, saveCommission, updateCommission, deleteCommission, updateErpCommission } from '../services/comision.service.js';
import { getEntity } from '../services/entidad.service.js';
import { getProductGroup } from '../services/grupoproducto.service.js';
import { getProduct } from '../services/producto.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';
import ImportErp from '../layouts/ImportErp.jsx';

export const ComisionApp = ({ userLog }) => {

    const [comisiones, setComisiones] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [subgrupos, setSubgrupos] = useState([]);
    const [productos, setProductos] = useState([]);
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

    const selected = {
        id: null,
        entidad: null,
        grupoproducto: null,
        subgrupoproducto: null,
        producto: null,
        basecalculo: "",
        porcentaje: 0,
        erpid: 0
    };
    const fieldSettings = {
        id: { hidden: true },
        entidad: {
            type: "object",
            notnull: true,
            options: entidades,
            searches: ['nomape', 'nrodoc'],
            label: "Entidad",
            getLabel: (item) => item?.nomape || "",
            autofocus: true,
            module: ['ca01'],
            listPath: "/home/cadastres/entities",
            popupTitle: "Entidades"
        },
        grupoproducto: {
            type: "object",
            options: grupos,
            searches: ['grupoproducto'],
            label: "Grupo de Producto",
            getLabel: (item) => item?.grupoproducto || "",
            module: ['pr01'],
            listPath: "/home/config/product/productgroups",
            popupTitle: "Grupos de Productos",
            disabledifvalues: ['subgrupoproducto', 'producto']
        },
        subgrupoproducto: {
            type: "object",
            options: subgrupos,
            searches: ['subgrupoproducto'],
            label: "Subgrupo de Producto",
            getLabel: (item) => item?.subgrupoproducto || "",
            module: ['pr01'],
            listPath: "/home/config/product/productgroups",
            popupTitle: "Grupos de Productos",
            disabledifvalues: ['producto', 'grupoproducto']
        },
        producto: {
            type: "object",
            options: productos,
            searches: ['nombrecomercial.nombrecomercial'],
            label: "Producto",
            getLabel: (item) => item?.nombrecomercial?.nombrecomercial || "",
            module: ['ca02'],
            listPath: "/home/cadastres/products",
            popupTitle: "Productos",
            disabledifvalues: ['grupoproducto', 'subgrupoproducto']
        },
        basecalculo: { type: "select", label: "Base de Cálculo", options: ["Precio", "Rentabilidad"], notnull: true },
        porcentaje: { notnull: true, type: "number", min: 0, max: 100 },
        erpid: { hidden: userLog?.id !== 1, type: "number", label: "ERPID" },
        zafras: { hidden: true }
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

    const guardarFn = async (formData) => {
        setLoading(true);

        const comisionAGuardar = { ...formData };

        if (comisionAGuardar.id) {
            await updateCommission(comisionAGuardar.id, comisionAGuardar);
            await AddAccess('Modificar', comisionAGuardar.id, userLog, "Comisiones");
        } else {
            const nuevoComision = await saveCommission(comisionAGuardar);
            await AddAccess('Insertar', nuevoComision.saved.id, userLog, "Comisiones");
        }
        recuperarComisiones();
        setLoading(false);
        setComisionAGuardar(null);
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
                <SmartModal
                    open={!!comisionAVisualizar}
                    onClose={() => setComisionAVisualizar(null)}
                    title="Comisión"
                    data={comisionAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {comisionAGuardar && (
                <SmartModal
                    open={!!comisionAGuardar}
                    onClose={() => setComisionAGuardar(null)}
                    title="Comisión"
                    data={comisionAGuardar}
                    onSave={handleSubmit}
                    mode={comisionAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
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
