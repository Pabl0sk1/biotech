import { useState, useEffect } from 'react';
import { getMenu, saveMenu, updateMenu, deleteMenu } from '../services/menu.service.js';
import { getPermission } from '../services/permiso.service.js';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from "../FiltroModal.jsx";
import Loading from '../layouts/Loading.jsx';
import NotDelete from '../layouts/NotDelete.jsx';
import Delete from '../layouts/Delete.jsx';

export const MenuApp = ({ userLog }) => {

    const [menus, setMenus] = useState([]);
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
        menu: "",
        icono: "",
        unico: false,
        activo: true,
        orden: 1,
        recursos: "",
        submenus: [],
        programas: []
    };

    const recuperarMenus = () => {
        setQuery(q => ({ ...q }));
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

    const eliminarMenuFn = async (id) => {
        setLoading(true);
        await deleteMenu(id);
        await AddAccess('Eliminar', id, userLog, "Menus");
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

    const guardarFn = async (menuAGuardar) => {
        setMenuAGuardar(null);
        setLoading(true);

        if (menuAGuardar.id) {
            await updateMenu(menuAGuardar.id, menuAGuardar);
            await AddAccess('Modificar', menuAGuardar.id, userLog, "Menus");
        } else {
            const nuevoMenu = await saveMenu(menuAGuardar);
            await AddAccess('Insertar', nuevoMenu.saved.id, userLog, "Menus");
        }
        recuperarMenus();
        setLoading(false);
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
            guardarFn({ ...menuAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
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
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    <div className='col me-5 pe-5'>
                                        <label htmlFor="menu" className="form-label m-0 mb-2">Descripción</label>
                                        <input
                                            type="text"
                                            id="menu"
                                            name="menu"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={menuAVisualizar.menu || ''}
                                            readOnly
                                        />
                                        <label htmlFor="recursos" className="form-label m-0 mb-2">Recursos</label>
                                        <input
                                            type="text"
                                            id="recursos"
                                            name="recursos"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={menuAVisualizar.recursos || ''}
                                            readOnly
                                        />
                                        <label htmlFor="activo" className="form-label m-0 mb-2 me-2 d-flex">Activo</label>
                                        <input
                                            type="checkbox"
                                            id="activo"
                                            name="activo"
                                            className="form-check-input"
                                            style={{ width: '60px', height: '30px' }}
                                            checked={menuAVisualizar.activo || ''}
                                            readOnly
                                        />
                                    </div>
                                    <div className='col ms-5 ps-5'>
                                        <label htmlFor="icono" className="form-label m-0 mb-2">Icono</label>
                                        <input
                                            type="text"
                                            id="icono"
                                            name="icono"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={menuAVisualizar.icono || ''}
                                            readOnly
                                        />
                                        <label htmlFor="orden" className="form-label m-0 mb-2">Orden</label>
                                        <input
                                            type="number"
                                            id="orden"
                                            name="orden"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={menuAVisualizar.orden || ''}
                                            readOnly
                                        />
                                        <label htmlFor="unico" className="form-label m-0 mb-2 me-2 d-flex">Único</label>
                                        <input
                                            type="checkbox"
                                            id="unico"
                                            name="unico"
                                            className="form-check-input"
                                            style={{ width: '60px', height: '30px' }}
                                            checked={menuAVisualizar.unico || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setMenuAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {menuAGuardar && (
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
                                        <div className='col me-5 pe-5'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="menu" className="form-label m-0 mb-2">Descripción</label>
                                                <input
                                                    type="text"
                                                    id="menu"
                                                    name="menu"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={menuAGuardar.menu || ''}
                                                    onChange={(event) => setMenuAGuardar({ ...menuAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    autoFocus
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La descripción es obligatoria y no debe sobrepasar los 50 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="recursos" className="form-label m-0 mb-2">Recursos</label>
                                                <input
                                                    type="text"
                                                    id="recursos"
                                                    name="recursos"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={menuAGuardar.recursos || ''}
                                                    onChange={(event) => setMenuAGuardar({ ...menuAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={255}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="activo" className="form-label m-0 mb-2 me-2 d-flex">Activo</label>
                                                <input
                                                    type="checkbox"
                                                    id="activo"
                                                    name="activo"
                                                    className="form-check-input"
                                                    style={{ width: '60px', height: '30px' }}
                                                    checked={menuAGuardar.activo || ''}
                                                    onChange={(e) => {
                                                        const check = e.target.checked;
                                                        setMenuAGuardar({ ...menuAGuardar, [e.target.name]: check });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className='col ms-5 ps-5'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="icono" className="form-label m-0 mb-2">Icono</label>
                                                <input
                                                    type="text"
                                                    id="icono"
                                                    name="icono"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={menuAGuardar.icono || ''}
                                                    onChange={(event) => setMenuAGuardar({ ...menuAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="orden" className="form-label m-0 mb-2">Orden</label>
                                                <input
                                                    type="number"
                                                    id="orden"
                                                    name="orden"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={menuAGuardar.orden || ''}
                                                    onChange={(event) => setMenuAGuardar({ ...menuAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="unico" className="form-label m-0 mb-2 me-2 d-flex">Único</label>
                                                <input
                                                    type="checkbox"
                                                    id="unico"
                                                    name="unico"
                                                    className="form-check-input"
                                                    style={{ width: '60px', height: '30px' }}
                                                    checked={menuAGuardar.unico || ''}
                                                    onChange={(e) => {
                                                        const check = e.target.checked;
                                                        setMenuAGuardar({ ...menuAGuardar, [e.target.name]: check });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setMenuAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <Header userLog={userLog} title={'MENUS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Menus
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
                                                                    await AddAccess('Visualizar', v.id, userLog, "Menus");
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
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => setMenuAGuardar(selected)} className="btn btn-secondary fw-bold me-2" disabled={!permiso?.puedeagregar}>
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
