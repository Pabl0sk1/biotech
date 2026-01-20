import { useEffect, useState } from "react";
import { getToken, saveToken, deleteToken } from '../services/token.service.js';
import { getPermission } from '../services/permiso.service.js';
import { AddAccess } from "../utils/AddAccess.js";
import { obtenerClaseEstadoReg } from '../utils/StatusBadge.js';
import { DateHourFormat } from '../utils/DateHourFormat.js';
import { FiltroModal } from '../FiltroModal.jsx';
import { ListControls } from '../ListControls.jsx';
import Loading from '../layouts/Loading.jsx';
import Delete from '../layouts/Delete.jsx';
import SaveModal from "../layouts/SaveModal.jsx";
import Header from '../Header';

export const TokenApp = ({ userLog }) => {

    const [tokens, setTokens] = useState([]);
    const [permiso, setPermiso] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [tokenAEliminar, setTokenAEliminar] = useState(null);
    const [tokenAGuardar, setTokenAGuardar] = useState(null);
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
                setTokenAEliminar(null);
                setTokenAGuardar(null);
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

    const recuperarTokens = () => {
        setQuery(q => ({ ...q }));
    };

    const permisoUsuario = async () => {
        const response = await getPermission('', '', '', `tipousuario.id:eq:${userLog?.tipousuario?.id};modulo.var:eq:sc04`);
        setPermiso(response.items[0]);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getToken(query.page, query.size, query.order, filtrosFinal);
            setTokens(response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
            permisoUsuario();
        };
        load();
    }, [query]);

    const eliminarTokenFn = async (id) => {
        setLoading(true);
        await deleteToken(id);
        await AddAccess('Eliminar', id, userLog, "Tokens");
        recuperarTokens();
        setLoading(false);
    };

    const confirmarEliminacion = (id) => {
        eliminarTokenFn(id);
        setTokenAEliminar(null);
    }

    const handleEliminarToken = async (token) => {
        setTokenAEliminar(token);
    };

    const guardarFn = async () => {
        setTokenAGuardar(null);
        setLoading(true);

        const nuevoToken = await saveToken(userLog?.id);
        await AddAccess('Insertar', nuevoToken.saved.id, userLog, "Tokens");
        recuperarTokens();
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

    const ocultarToken = (cadena, id, estado) => {
        if (userLog?.id === 1 || userLog?.id === id) {
            return (
                <p className={`${estado ? '' : 'text-decoration-line-through'} m-0`}>
                    {cadena}
                </p>
            );
        } else {
            const hiddenCount = cadena.length;
            return (
                <>
                    {Array.from({ length: hiddenCount }).map((_, i) => (
                        <i key={i} className="bi bi-asterisk text-muted ms-1" style={{ fontSize: '7px' }}></i>
                    ))}
                </>
            );
        }
    }

    const refrescar = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    }

    const rows = [...tokens];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {loading && (
                <Loading />
            )}
            {tokenAEliminar && (
                <Delete setEliminar={setTokenAEliminar} title={'token'} gen={true} confirmar={confirmarEliminacion} id={tokenAEliminar.id} />
            )}
            {tokenAGuardar && (
                <SaveModal setGuardar={setTokenAGuardar} title={'token'} gen={true} fun={guardarFn} />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'TOKENS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-1 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Tokens
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
                                        <th>Token</th>
                                        <th onClick={() => toggleOrder("usuario.nombreusuario")} className="sortable-header">
                                            Usuario
                                            <i className={`bi ${getSortIcon("usuario.nombreusuario")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["usuario.nombreusuario"] ?? {};
                                                    setFiltroActivo({
                                                        field: "usuario.nombreusuario",
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
                                        <th onClick={() => toggleOrder("fechacreacion")} className="sortable-header">
                                            Fecha de Creación
                                            <i className={`bi ${getSortIcon("fechacreacion")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["fechacreacion"] ?? {};
                                                    setFiltroActivo({
                                                        field: "fechacreacion",
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
                                        <th onClick={() => toggleOrder("fechaexpiracion")} className="sortable-header">
                                            Fecha de Expiración
                                            <i className={`bi ${getSortIcon("fechaexpiracion")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["fechaexpiracion"] ?? {};
                                                    setFiltroActivo({
                                                        field: "fechaexpiracion",
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
                                    {tokens.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-3 text-muted fs-3 fw-bold">
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.filter(v => v).map((v, index) => {
                                            const puedeEliminar = permiso?.puedeeliminar && v.id !== 1;
                                            return (
                                                <tr
                                                    className="text-center align-middle"
                                                    key={v ? v.id : `empty-${index}`}
                                                >
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{ocultarToken(v.token, v.usuario.id, v.activo)}</td>
                                                    <td>{v.usuario.nombreusuario}</td>
                                                    <td>{DateHourFormat(v.fechacreacion, 0)}</td>
                                                    <td>{DateHourFormat(v.fechaexpiracion, 0)}</td>
                                                    <td style={{ width: '140px' }}>
                                                        <p className={`text-center mx-auto w-75 ${obtenerClaseEstadoReg(v.activo)} m-0 rounded-2 border border-black`}>
                                                            {v.estado}
                                                        </p>
                                                    </td>
                                                    <td style={{ width: '80px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (puedeEliminar) handleEliminarToken(v);
                                                            }}
                                                            className="btn border-0 p-0"
                                                            style={{ cursor: puedeEliminar ? 'pointer' : 'default' }}
                                                        >
                                                            <i className={`bi bi-trash-fill ${puedeEliminar ? 'text-danger' : 'text-danger-emphasis'}`}></i>
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
                            onAdd={() => setTokenAGuardar(true)}
                            onRefresh={refrescar}
                            canAdd={permiso?.puedeagregar}
                            showErpButton={false}
                            showAddButton={true}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
