import { useEffect, useState } from "react";
import { getTokenPaginado, saveToken, deleteToken, getTokenPorUsuario } from '../services/token.service.js';
import { saveAuditoria, getNetworkInfo } from '../services/auditoria.service.js';
import Header from '../Header';

export const TokenApp = ({ usuarioUsed }) => {

    const [usuarioBuscado, setUsuarioBuscado] = useState('');
    const [tokens, setTokens] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [tokenAEliminar, setTokenAEliminar] = useState(null);
    const [tokenAGuardar, setTokenAGuardar] = useState(null);

    //Cancelar eliminación con tecla de escape
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

    //Validación personalizada de formulario
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

    const obtenerFechaHora = async () => {
        const localDate = new Date();

        const dia = String(localDate.getDate()).padStart(2, '0');
        const mes = String(localDate.getMonth()).padStart(2, '0');
        const anio = localDate.getFullYear();
        const hora = String(localDate.getHours() - 3).padStart(2, '0');
        const minuto = String(localDate.getMinutes()).padStart(2, '0');

        return new Date(anio, mes, dia, hora, minuto);
    };

    const agregarAcceso = async (op, cod) => {
        const network = await recuperarNetworkInfo();
        const fechahora = await obtenerFechaHora();
        const auditoria = {
            id: null,
            usuario: {
                id: usuarioUsed.id
            },
            fechahora: fechahora,
            programa: "Tokens",
            operacion: op,
            codregistro: cod,
            ip: network.ip,
            equipo: network.equipo
        }
        await saveAuditoria(auditoria);
    }

    const recuperarTokens = async (pageNumber = 0, desc = '') => {
        const response = await getTokenPaginado(pageNumber);

        const tokenFiltrados = response.tokens.content.filter(token => {
            const tokenCoincide = desc.trim() !== '' ? token.token.toLowerCase().includes(desc.toLowerCase()) : true;

            return tokenCoincide;
        });

        return {
            tokens: tokenFiltrados,
            totalPages: response.totalPages,
            currentPage: response.currentPage,
        };
    };

    const recuperarNetworkInfo = async () => {
        const response = await getNetworkInfo();
        return response;
    }

    const recuperarTokensConFiltro = async (page) => {
        if (usuarioBuscado.trim() === '') {
            return await recuperarTokens(page, usuarioBuscado);
        } else {
            return await getTokenPorUsuario(usuarioBuscado, page);
        }
    };

    useEffect(() => {
        recuperarTokens(page, usuarioBuscado);
    }, []);

    const actualizarToken = async () => {
        const resultado = await recuperarTokensConFiltro(page);
        setTokens(resultado.tokens);
        setTotalPages(resultado.totalPages);
        if (page >= resultado.totalPages) setPage(0);
    }

    useEffect(() => {
        const buscarTokens = async () => {
            try {
                actualizarToken();
            } catch (error) {
                console.error('Error buscando tokens:', error);
            }
        };

        buscarTokens();
    }, [page, usuarioBuscado]);

    const eliminarTokenFn = async (id) => {
        try {
            await deleteToken(id);
            agregarAcceso('Eliminar', id);
            actualizarToken();
        } catch (error) {
            console.error('Error eliminando tipos de usuarios:', error);
        }
    };

    const confirmarEliminacion = (id) => {
        eliminarTokenFn(id);
        setTokenAEliminar(null);
    }

    const handleEliminarToken = (token) => {

        setTokenAEliminar(token);
    };

    const guardarFn = async () => {

        const nuevoToken = await saveToken(usuarioUsed.id);
        agregarAcceso('Insertar', nuevoToken.id);

        setTokenAGuardar(null);
        actualizarToken();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const formatearFechaYHora = (fecha) => {
        const date = new Date(fecha);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const anio = date.getFullYear();
        const hora = String(date.getHours()).padStart(2, '0');
        const minuto = String(date.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
    };

    const ocultarToken = (cadena, id, estado) => {
        if (usuarioUsed.id === 1 || usuarioUsed.id === id) {
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
                        <i key={i} className="bi bi-asterisk text-muted ms-1" style={{ fontSize: '10px' }}></i>
                    ))}
                </>
            );
        }
    }

    const obtenerEstadoCompleto = (estado) => {
        return estado ? 'Activo' : 'Expirado';
    };
    const obtenerClaseEstado = (estado) => {
        return estado ? 'text-bg-success' : 'text-bg-danger';
    };

    const refrescar = () => {
        setUsuarioBuscado('');
    }

    return (
        <>

            {tokenAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar el token?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(tokenAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setTokenAEliminar(null)}
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

            {tokenAGuardar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Deseas generar un nuevo token para tu usuario?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => guardarFn()}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-check me-2"></i>Aceptar
                                    </button>
                                    <button
                                        onClick={() => setTokenAGuardar(null)}
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

            <div className="modern-container colorPrimario">
                <Header usuarioUsed={usuarioUsed} title={'TOKENS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />

                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-1 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Tokens
                        </p>
                        <div className="p-3">
                            <div className="d-flex align-items-center mb-3 fw-bold">
                                <label htmlFor="usuario" className="form-label m-0">Usuario</label>
                                <input
                                    type="text"
                                    id="usuario"
                                    name="usuario"
                                    className="me-4 ms-2 form-control border-input"
                                    placeholder='Escribe...'
                                    value={usuarioBuscado}
                                    onChange={(e) => setUsuarioBuscado(e.target.value)}
                                />
                            </div>
                            <table className='table table-bordered table-sm table-hover m-0 border-secondary-subtle'>
                                <thead className='table-success'>
                                    <tr>
                                        <th>#</th>
                                        <th>Token</th>
                                        <th>Usuario</th>
                                        <th>Fecha de Creación</th>
                                        <th>Fecha de Expiración</th>
                                        <th>Estado</th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.length > 0 ? (
                                        [...tokens.slice(0, 10), ...Array(Math.max(0, 10 - tokens.length)).fill(null)].map((v, index) => (
                                            <tr className="text-center align-middle" key={v ? v.id : `empty-${index} `}>
                                                {v ? (
                                                    <>
                                                        <td style={{ width: '60px' }}>{v.id}</td>
                                                        <td className='text-start'>{ocultarToken(v.token, v.usuario.id, v.activo)}</td>
                                                        <td>{v.usuario.nombreusuario}</td>
                                                        <td>{formatearFechaYHora(v.fecha_creacion)}</td>
                                                        <td>{formatearFechaYHora(v.fecha_expiracion)}</td>
                                                        <td style={{ width: '110px' }}>
                                                            <p className={`text-center mx-auto w-75 ${obtenerClaseEstado(v.activo)} m-0 rounded-2 border border-black`}>
                                                                {obtenerEstadoCompleto(v.activo)}
                                                            </p>
                                                        </td>
                                                        <td style={{ width: '80px' }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (v.usuario.id != 1 || v.usuario.id === usuarioUsed.id || usuarioUsed.id === 1) {
                                                                        handleEliminarToken(v)
                                                                    }
                                                                }}
                                                                className="btn border-0 p-0"
                                                                style={{ cursor: v.usuario.id != 1 || v.usuario.id === usuarioUsed.id || usuarioUsed.id === 1 ? 'pointer' : 'default' }}
                                                            >
                                                                <i className={`bi bi-trash-fill ${v.usuario.id != 1 || v.usuario.id === usuarioUsed.id || usuarioUsed.id === 1 ? 'text-danger' : 'text-danger-emphasis'} `}></i>
                                                            </button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>&nbsp;</td>
                                                        <td>&nbsp;</td>
                                                        <td>&nbsp;</td>
                                                        <td>&nbsp;</td>
                                                        <td>&nbsp;</td>
                                                        <td>&nbsp;</td>
                                                        <td>&nbsp;</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="text-center align-middle">
                                            <td colSpan="7" className="text-center" style={{ height: '325px' }}>
                                                <div className='fw-bolder fs-1'>No hay tokens disponibles</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => setTokenAGuardar(true)} className="btn btn-success text-black fw-bold me-3">
                                <i className="bi bi-plus-lg me-2"></i>Generar
                            </button>
                            <button onClick={() => refrescar()} className="btn btn-warning text-black fw-bold ms-3">
                                <i className="bi bi-arrow-clockwise me-2"></i>Refrescar
                            </button>
                            <nav aria-label="page navigation" className='user-select-none ms-auto'>
                                <ul className="pagination m-0">
                                    <li className={`page-item ${page === 0 ? 'disabled' : ''} `}>
                                        <button className={`page-link ${page === 0 ? 'rounded-end-0 border-black' : 'text-bg-light rounded-end-0 border-black'} `} onClick={() => handlePageChange(page - 1)}>Anterior</button>
                                    </li>
                                    <li className="page-item disabled">
                                        <button className="page-link text-bg-warning rounded-0 fw-bold border-black">{page + 1}</button>
                                    </li>
                                    <li className={`page-item ${(page === totalPages - 1 || tokens.length === 0) ? 'disabled' : ''} `}>
                                        <button className={`page-link ${(page === totalPages - 1 || tokens.length === 0) ? 'rounded-start-0 border-black' : 'text-bg-light rounded-start-0 border-black'} `} onClick={() => handlePageChange(page + 1)}>Siguiente</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div >
                </div >
            </div >
        </>
    );
}
