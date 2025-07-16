import { useState, useEffect } from 'react';
import { getAuditoriaPaginado, deleteAuditoria, getAuditoriaPorUsuario, getAuditoriaPorOperacion, getAuditoriaPorUsuarioYOperacion } from '../services/auditoria.service.js';
import { Link } from 'react-router-dom';

export const AuditoriaApp = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

    const [operacionBuscado, setOperacionBuscado] = useState('');
    const [usuarioBuscado, setUsuarioBuscado] = useState('');
    const [auditorias, setAuditorias] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [auditoriaAEliminar, setAuditoriaAEliminar] = useState(null);
    const [auditoriaAVisualizar, setAuditoriaAVisualizar] = useState(null);

    //Cancelar eliminación con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setAuditoriaAEliminar(null);
                setAuditoriaAVisualizar(null);
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

    const recuperarAuditorias = async (pageNumber = 0, operacion = '', usuario = '') => {
        const response = await getAuditoriaPaginado(pageNumber);

        // Filtrar auditorias por rol, nombre y estado en un solo paso
        const auditoriasFiltrados = response.auditorias.filter(auditoria => {
            const operacionCoincide = operacion !== '' ? auditoria.operacion === operacion : true;
            const usuarioCoincide = usuario ? auditoria.usuario.id === parseInt(usuario) : true;

            return operacionCoincide && usuarioCoincide;
        });

        return {
            auditorias: auditoriasFiltrados,
            totalPages: response.totalPages,
            currentPage: response.currentPage,
        };
    };

    const recuperarAuditoriasConFiltro = async (page) => {
        if (operacionBuscado === '' && usuarioBuscado === '') {
            return await recuperarAuditorias(page, operacionBuscado, usuarioBuscado);
        } else {
            if (operacionBuscado !== '' && usuarioBuscado !== '') {
                return await getAuditoriaPorUsuarioYOperacion(usuarioBuscado, operacionBuscado, page);
            } else if (operacionBuscado !== '') {
                return await getAuditoriaPorOperacion(operacionBuscado, page);
            } else if (usuarioBuscado !== '') {
                return await getAuditoriaPorUsuario(usuarioBuscado, page);
            }
        }
    }

    useEffect(() => {
        recuperarAuditorias(page, operacionBuscado, usuarioBuscado);
    }, []);

    const actualizarAuditorias = async () => {
        const resultado = await recuperarAuditoriasConFiltro(page);
        setAuditorias(resultado.auditorias);
        setTotalPages(resultado.totalPages);
        if (page >= resultado.totalPages) setPage(0);
    }

    useEffect(() => {
        const buscarAuditorias = async () => {
            try {
                actualizarAuditorias();
            } catch (error) {
                console.error('Error buscando auditorias:', error);
            }
        };

        buscarAuditorias();
    }, [page, operacionBuscado, usuarioBuscado]);

    const eliminarAuditoriaFn = async (id) => {
        try {
            await deleteAuditoria(id);
            actualizarAuditorias();
        } catch (error) {
            console.error('Error buscando auditorias:', error);
        }
    };

    const confirmarEliminacion = (id) => {
        eliminarAuditoriaFn(id);
        setAuditoriaAEliminar(null);
    }

    // Controla el cambio de página
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const formatearFechaYHora = (fecha) => {
        const date = new Date(fecha);
        const dia = String(date.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
        const mes = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados, así que sumamos 1
        const anio = date.getFullYear();
        const hora = String(date.getHours()).padStart(2, '0'); // Asegura que la hora tenga 2 dígitos
        const minuto = String(date.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan 2 dígitos
        return `${dia}/${mes}/${anio} ${hora}:${minuto}`; // Formato DD/MM/YYYY HH:MM:SS
    };

    const refrescar = () => {
        setOperacionBuscado('');
        setUsuarioBuscado('');
    };

    return (
        <>

            {auditoriaAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-warning alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar el acceso?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(auditoriaAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setAuditoriaAEliminar(null)}
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

            {auditoriaAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-warning alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <label htmlFor="usuario" className="form-label m-0 mb-2">Usuario</label>
                                        <input
                                            type="text"
                                            id="usuario"
                                            name="usuario"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.usuario.nombreusuario}
                                            readOnly
                                        />
                                        <label htmlFor="modulo" className="form-label m-0 mb-2">Módulo</label>
                                        <input
                                            type="text"
                                            id="modulo"
                                            name="modulo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.programa}
                                            readOnly
                                        />
                                        <label htmlFor="operacion" className="form-label m-0 mb-2">Operación</label>
                                        <input
                                            type="text"
                                            id="operacion"
                                            name="operacion"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.operacion}
                                            readOnly
                                        />
                                        <label htmlFor="fechahora" className="form-label m-0 mb-2">Fecha y Hora</label>
                                        <input
                                            type="datetime-local"
                                            id="fechahora"
                                            name="fechahora"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.fechahora}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <label htmlFor="codregistro" className="form-label m-0 mb-2">Cód. Registro</label>
                                        <input
                                            type="number"
                                            id="codregistro"
                                            name="codregistro"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.codregistro}
                                            readOnly
                                        />
                                        <label htmlFor="ip" className="form-label m-0 mb-2">IP</label>
                                        <input
                                            type="text"
                                            id="ip"
                                            name="ip"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.ip}
                                            readOnly
                                        />
                                        <label htmlFor="equipo" className="form-label m-0 mb-2">Equipo</label>
                                        <input
                                            type="text"
                                            id="equipo"
                                            name="equipo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={auditoriaAVisualizar.equipo}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setAuditoriaAVisualizar(null)} className="btn btn-danger mt-3 text-black fw-bold">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="row-cols-auto w-100 m-0">
                <nav className="navbar navbar-expand-lg navbar-light bg-white top-0 position-fixed p-0 z-1 w-100 user-select-none border-3 border-black border-bottom">
                    <div className="d-flex w-100">
                        <div className="col-2 d-flex align-items-center m-0 p-1 ps-3 border-end border-dark border-3">
                            <Link className='p-0 text-black ps-1 pe-1 border-0 menuList d-flex' to={UrlBase + "/home"}>
                                <i className='bi bi-chevron-double-left fs-3' style={{ textShadow: '1px 0 0 black, 0 1px 0 black, -1px 0 0 black, 0 -1px 0 black' }}></i>
                            </Link>
                            <p className='container m-0 p-0'>ACCESOS</p>
                        </div>
                        <div className='d-flex align-items-center ps-3'>
                            <i className='bi bi-person fs-3 me-3'></i>
                            <p className='m-0'>{usuarioUsed.tipousuario.tipousuario}</p>
                        </div>
                        <div className='d-flex align-items-center ms-auto'>
                            <img className="navbar-brand p-0 m-0 me-3" src="/logo2.svg" alt="Maria Mora Atelier" style={{ width: '120px', height: '40px' }} />
                        </div>
                    </div>
                </nav>

                <div className="container-fluid p-0 m-0 mt-3 pt-5 ms-3 me-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb colorSecundario border m-0 user-select-none ps-3 pt-2 pb-2 h6">
                            <li className="breadcrumb-item">
                                <i className="bi bi-house-fill me-2 text-black"></i><Link className="text-black breadLink" to={UrlBase + "/home"}>Inicio</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                <i className="bi bi-lock-fill me-2 text-black"></i>Seguridad
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Accesos
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Accesos
                        </p>
                        <div className="p-3">
                            <div className="d-flex align-items-center mb-3 fw-bold">
                                <label htmlFor="usuario" className="form-label m-0">Usuario</label>
                                <input
                                    type='text'
                                    id="usuario"
                                    name="usuario"
                                    className="me-4 ms-2 form-control border-input"
                                    placeholder='Escribe...'
                                    value={usuarioBuscado}
                                    onChange={(e) => { setUsuarioBuscado(e.target.value); }}
                                />
                                <label htmlFor="operacion" className="form-label m-0">Operación</label>
                                <select
                                    id="operacion"
                                    name="operacion"
                                    className="me-4 ms-2 form-select border-input"
                                    value={operacionBuscado}
                                    onChange={(e) => setOperacionBuscado(e.target.value)} // Actualiza el estado al escribir
                                >
                                    <option value="">Seleccione una operación...</option>
                                    <option value="Insertar">Insertar</option>
                                    <option value="Modificar">Modificar</option>
                                    <option value="Eliminar">Eliminar</option>
                                    <option value="Visualizar">Visualizar</option>
                                    <option value="Consultar">Consultar</option>
                                    <option value="Realizar Informe">Realizar Informe</option>
                                    <option value="Iniciar Sesión">Iniciar Sesión</option>
                                    <option value="Cerrar Sesión">Cerrar Sesión</option>
                                </select>
                            </div>
                            <table className='table table-bordered table-sm table-hover m-0 border-secondary-subtle'>
                                <thead className='table-warning'>
                                    <tr>
                                        <th>#</th>
                                        <th>Usuario</th>
                                        <th>Fecha y Hora</th>
                                        <th>Módulo</th>
                                        <th>Operación</th>
                                        <th>Cód. Registro</th>
                                        <th>IP</th>
                                        <th>Equipo</th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditorias.length > 0 ? (
                                        [...auditorias.slice(0, 10), ...Array(Math.max(0, 10 - auditorias.length)).fill(null)].map((v, index) => (
                                            <tr className="text-center align-middle" key={v ? v.id : `empty-${index}`}>
                                                {v ? (
                                                    <>
                                                        <td style={{ width: '60px' }}>{v.id}</td>
                                                        <td className='text-start'>{v.usuario.nombreusuario}</td>
                                                        <td>{formatearFechaYHora(v.fechahora)}</td>
                                                        <td>{v.programa}</td>
                                                        <td>{v.operacion}</td>
                                                        <td>{v.codregistro}</td>
                                                        <td>{v.ip}</td>
                                                        <td>{v.equipo}</td>
                                                        <td style={{ width: '100px' }}>
                                                            <button
                                                                onClick={() => setAuditoriaAEliminar(v)}
                                                                className="btn border-0 me-2 p-0"
                                                            >
                                                                <i className="bi bi-trash-fill text-danger"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => setAuditoriaAVisualizar(v)}
                                                                className="btn border-0 ms-2 p-0"
                                                            >
                                                                <i className="bi bi-eye-fill text-primary p-0"></i>
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
                                                        <td>&nbsp;</td>
                                                        <td>&nbsp;</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="text-center align-middle">
                                            <td colSpan="9" className="text-center" style={{ height: '325px' }}>
                                                <div className='fw-bolder fs-1'>No hay accesos disponibles</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => refrescar()} className="btn btn-warning text-black fw-bold">
                                <i className="bi bi-arrow-clockwise me-2"></i>Refrescar
                            </button>
                            <nav aria-label="page navigation" className='user-select-none ms-auto'>
                                <ul className="pagination m-0">
                                    <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                        <button className={`page-link ${page === 0 ? 'rounded-end-0 border-black' : 'text-bg-light rounded-end-0 border-black'}`} onClick={() => handlePageChange(page - 1)}>Anterior</button>
                                    </li>
                                    <li className="page-item disabled">
                                        <button className="page-link text-bg-warning rounded-0 fw-bold border-black">{page + 1}</button>
                                    </li>
                                    <li className={`page-item ${(page === totalPages - 1 || auditorias.length === 0) ? 'disabled' : ''}`}>
                                        <button className={`page-link ${(page === totalPages - 1 || auditorias.length === 0) ? 'rounded-start-0 border-black' : 'text-bg-light rounded-start-0 border-black'}`} onClick={() => handlePageChange(page + 1)}>Siguiente</button>
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
