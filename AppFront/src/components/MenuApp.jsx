import { useState, useEffect } from 'react';
import { getMenu, saveMenu, updateMenu, deleteMenu } from '../services/menu.service.js';
import { getModule } from '../services/modulo.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from "../FiltroModal.jsx";
import { ListControls } from '../ListControls.jsx';
import Header from '../Header.jsx';
import SmartModal from '../ModernModal.jsx';
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';

export const MenuApp = ({ userLog }) => {

    const [menus, setMenus] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [menuAGuardar, setMenuAGuardar] = useState(null);
    const [menuAEliminar, setMenuAEliminar] = useState(null);
    const [menuNoEliminar, setMenuNoEliminar] = useState(null);
    const [menuAVisualizar, setMenuAVisualizar] = useState(null);
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
                setMenuAEliminar(null);
                setMenuNoEliminar(null);
                setMenuAVisualizar(null);
                setMenuAGuardar(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selected = {
        id: null,
        menu: "",
        icono: "",
        orden: 1,
        recursos: "",
        unico: false,
        activo: true,
    };
    const fieldSettings = {
        id: { hidden: true },
        menu: { label: "Descripción", notnull: true, order: 1, autofocus: true },
        orden: { type: "number", order: 4 },
        icono: { order: 3 },
        recursos: {
            type: "object.multiple",
            options: modulos,
            searches: ['moduloes', 'var'],
            getLabel: (item) => item?.moduloes || "",
            idfield: 'var',
            module: ['sc02'],
            listPath: "/home/security/modules",
            popupTitle: "Módulos",
            order: 2
        },
        unico: { label: "¿Es menú único?", type: "checkbox" },
        activo: { label: "¿Está activo?", type: "checkbox" },
        submenus: { hidden: true },
        programas: { hidden: true }
    };

    const recuperarMenus = () => {
        setQuery(q => ({ ...q }));
    }

    const recuperarModulos = async () => {
        const response = await getModule();
        setModulos(response.items);
    }

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc07`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getMenu(query.page, query.size, query.order, filtrosFinal);
            setMenus(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    useEffect(() => {
        recuperarModulos();
    }, []);

    const eliminarMenuFn = async (id) => {
        setLoading(true);
        await deleteMenu(id);
        await AddAccess('Eliminar', id, userLog, "Menús");
        recuperarMenus();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarMenuFn(id);
        setMenuAEliminar(null);
    }

    const handleEliminarMenu = async (menu) => {
        // const rel = await getProduct('', '', '', `tipoproducto.id:eq:${menu?.id}`);
        // if (rel.items.length > 0) setMenuNoEliminar(menu);
        setMenuAEliminar(menu);
    };

    const guardarFn = async (formData) => {
        setLoading(true);

        const menuAGuardar = {
            ...formData,
            recursos: formData?.recursos.toLowerCase() || ""
        };

        if (menuAGuardar.id) {
            await updateMenu(menuAGuardar.id, menuAGuardar);
            await AddAccess('Modificar', menuAGuardar.id, userLog, "Menús");
        } else {
            const nuevoMenu = await saveMenu(menuAGuardar);
            await AddAccess('Insertar', nuevoMenu.saved.id, userLog, "Menús");
        }
        recuperarMenus();
        setLoading(false);
        setMenuAGuardar(null);
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
    }

    const rows = [...menus];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {menuAEliminar && (
                <Delete setEliminar={setMenuAEliminar} title={'menu'} gen={true} confirmar={confirmarEliminacion} id={menuAEliminar.id} />
            )}
            {menuNoEliminar && (
                <NotDelete setNoEliminar={setMenuNoEliminar} title={'menu'} gen={true} />
            )}

            {menuAVisualizar && (
                <SmartModal
                    open={!!menuAVisualizar}
                    onClose={() => setMenuAVisualizar(null)}
                    title="Menú"
                    data={menuAVisualizar}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            {menuAGuardar && (
                <SmartModal
                    open={!!menuAGuardar}
                    onClose={() => setMenuAGuardar(null)}
                    title="Menú"
                    data={menuAGuardar}
                    onSave={handleSubmit}
                    mode={menuAGuardar.id ? 'edit' : 'create'}
                    fieldSettings={fieldSettings}
                    userLog={userLog}
                />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'MENÚS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Menús
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
                                        <th onClick={() => toggleOrder("menu")} className="sortable-header">
                                            Descripción
                                            <i className={`bi ${getSortIcon("menu")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["menu"] ?? {};
                                                    setFiltroActivo({
                                                        field: "menu",
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
                                        <th onClick={() => toggleOrder("orden")} className="sortable-header">
                                            Orden
                                            <i className={`bi ${getSortIcon("orden")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["orden"] ?? {};
                                                    setFiltroActivo({
                                                        field: "orden",
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
                                    {menus.length === 0 ? (
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
                                                        if (puedeEditar) setMenuAGuardar(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.menu}</td>
                                                    <td>{v.orden}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarMenu(v);
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Menús");
                                                                    setMenuAVisualizar(v);
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
                            onAdd={() => setMenuAGuardar(selected)}
                            onRefresh={refrescar}
                            canAdd={permiso?.puedeagregar}
                            canImport={permiso?.puedeimportar}
                            showErpButton={false}
                            showAddButton={true}
                            addData={selected}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
