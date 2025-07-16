import { useEffect, useState } from "react";
import { getTipoUsuarioPaginado, saveTipoUsuario, updateTipoUsuario, deleteTipoUsuario, getTipoUsuarioPorDesc } from '../services/tipousuario.service.js';
import { getUsuario } from "../services/usuario.service.js";
import { Link } from 'react-router-dom';
import { saveAuditoria, getNetworkInfo } from '../services/auditoria.service.js';

export const RolApp = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

    const [tipoUsuarioBuscado, setTipoUsuarioBuscado] = useState('');
    const [tipousuarios, setTipoUsuarios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [tipoUsuarioAGuardar, setTipoUsuarioAGuardar] = useState(null);
    const [tipoUsuarioAEliminar, setTipoUsuarioAEliminar] = useState(null);
    const [tipoUsuarioNoEliminar, setTipoUsuarioNoEliminar] = useState(null);
    const [tipoUsuarioAVisualizar, setTipoUsuarioAVisualizar] = useState(null);

    //Cancelar eliminación con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setTipoUsuarioAEliminar(null);
                setTipoUsuarioNoEliminar(null);
                setTipoUsuarioAVisualizar(null);
                setTipoUsuarioAGuardar(null);
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

        const dia = String(localDate.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
        const mes = String(localDate.getMonth()).padStart(2, '0'); // Los meses son 0-indexados, así que sumamos 1
        const anio = localDate.getFullYear();
        const hora = String(localDate.getHours() - 3).padStart(2, '0'); // Asegura que la hora tenga 2 dígitos
        const minuto = String(localDate.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan 2 dígitos

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
            programa: "Roles",
            operacion: op,
            codregistro: cod,
            ip: network.ip,
            equipo: network.equipo
        }
        await saveAuditoria(auditoria);
    }

    const tipousuarioSelected = {
        id: null,
        tipousuario: ""
    };

    const recuperarTipoUsuarios = async (pageNumber = 0, desc = '') => {
        const response = await getTipoUsuarioPaginado(pageNumber);
        const tipousuariosFiltrados = response.tipousuarios.filter(tipousuario => {
            const tipousuarioCoincide = desc.trim() !== '' ? tipousuario.tipousuario.toLowerCase().includes(desc.toLowerCase()) : true;

            return tipousuarioCoincide;
        });

        return {
            tipousuarios: tipousuariosFiltrados,
            totalPages: response.totalPages,
            currentPage: response.currentPage,
        };
    };

    const recuperarUsuarios = async () => {
        const response = await getUsuario();
        setUsuarios(response);
    }

    const recuperarNetworkInfo = async () => {
        const response = await getNetworkInfo();
        return response;
    }

    const recuperarTipoUsuariosConFiltro = async (page) => {
        if (tipoUsuarioBuscado.trim() === '') {
            return await recuperarTipoUsuarios(page, tipoUsuarioBuscado);
        } else {
            return await getTipoUsuarioPorDesc(tipoUsuarioBuscado, page);
        }
    };

    useEffect(() => {
        recuperarTipoUsuarios(page, tipoUsuarioBuscado);
        recuperarUsuarios();
    }, []);

    const actualizarRoles = async () => {
        const resultado = await recuperarTipoUsuariosConFiltro(page);
        setTipoUsuarios(resultado.tipousuarios);
        setTotalPages(resultado.totalPages);
        if (page >= resultado.totalPages) setPage(0);
    }

    useEffect(() => {
        const buscarTipoUsuarios = async () => {
            try {
                actualizarRoles();
            } catch (error) {
                console.error('Error buscando tipos de usuarios:', error);
            }
        };

        buscarTipoUsuarios();
    }, [page, tipoUsuarioBuscado]);

    const eliminarTipoUsuarioFn = async (id) => {
        try {
            await deleteTipoUsuario(id);
            agregarAcceso('Eliminar', id);
            actualizarRoles();
        } catch (error) {
            console.error('Error eliminando tipos de usuarios:', error);
        }
    };

    const confirmarEliminacion = (id) => {
        eliminarTipoUsuarioFn(id);
        setTipoUsuarioAEliminar(null);
    }

    const handleEliminarTipoUsuario = (tipousuario) => {
        const usuariosrelacionado = usuarios.find(v => v.tipousuario.id === tipousuario.id);

        if (usuariosrelacionado) {
            setTipoUsuarioNoEliminar(tipousuario);
        } else {
            setTipoUsuarioAEliminar(tipousuario);
        }
    };

    const guardarFn = async (tipoUsuarioAGuardar) => {

        if (tipoUsuarioAGuardar.id) {
            await updateTipoUsuario(tipoUsuarioAGuardar.id, tipoUsuarioAGuardar);
            agregarAcceso('Modificar', tipoUsuarioAGuardar.id);
        } else {
            const nuevoRol = await saveTipoUsuario(tipoUsuarioAGuardar);
            agregarAcceso('Insertar', nuevoRol.id);
        }

        setTipoUsuarioAGuardar(null);
        actualizarRoles();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity()) {
            guardarFn({ ...tipoUsuarioAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setTipoUsuarioBuscado('');
    }

    return (
        <>

            {tipoUsuarioAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-warning alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar el rol?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(tipoUsuarioAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setTipoUsuarioAEliminar(null)}
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

            {tipoUsuarioNoEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-warning alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-database-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>El rol está siendo referenciado en otra tabla</p>
                                </div>
                                <button
                                    onClick={() => setTipoUsuarioNoEliminar(null)}
                                    className="btn btn-danger mt-3 fw-bold text-black">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {tipoUsuarioAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-warning alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    <div className='col'>
                                        <label htmlFor="tipousuario" className="form-label m-0 mb-2">Descripción</label>
                                        <input
                                            type="text"
                                            id="tipousuario"
                                            name="tipousuario"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={tipoUsuarioAVisualizar.tipousuario}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setTipoUsuarioAVisualizar(null)} className="btn btn-danger mt-3 text-black fw-bold">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {tipoUsuarioAGuardar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-warning alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <form
                                    action="url.ph"
                                    onSubmit={handleSubmit}
                                    className="needs-validation"
                                    noValidate
                                >
                                    <div className="row mb-3 fw-semibold text-start">
                                        <div className='col'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="tipousuario" className="form-label m-0 mb-2">Descripción</label>
                                                <input
                                                    type="text"
                                                    id="tipousuario"
                                                    name="tipousuario"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={tipoUsuarioAGuardar.tipousuario}
                                                    onChange={(event) => setTipoUsuarioAGuardar({ ...tipoUsuarioAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    autoFocus
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La descripción es obligatoria y no debe sobrepasar los 50 caracteres.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setTipoUsuarioAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
                                            <i className="bi bi-x-lg me-2"></i>Cancelar
                                        </button>
                                    </div>
                                </form>
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
                            <p className='container m-0 p-0'>ROLES</p>
                        </div>
                        <div className='d-flex align-items-center ps-3'>
                            <i className='bi bi-person fs-3 me-3'></i>
                            <p className='m-0'>{usuarioUsed.tipousuario.tipousuario}</p>
                        </div>
                        <div className='d-flex align-items-center ms-auto'>
                            <img className="navbar-brand p-0 m-0 me-3" src="/logo.svg" alt="Maria Mora Atelier" style={{ width: '120px', height: '40px' }} />
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
                                Roles
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Roles
                        </p>
                        <div className="p-3">
                            <div className="d-flex align-items-center mb-3 fw-bold">
                                <label htmlFor="tipousuario" className="form-label m-0">Descripción</label>
                                <input
                                    type="text"
                                    id="tipousuario"
                                    name="tipousuario"
                                    className="me-4 ms-2 form-control border-input"
                                    placeholder='Escribe...'
                                    value={tipoUsuarioBuscado}
                                    onChange={(e) => setTipoUsuarioBuscado(e.target.value)} // Actualiza el estado al escribir
                                />
                            </div>
                            <table className='table table-bordered table-sm table-hover m-0 border-secondary-subtle'>
                                <thead className='table-warning'>
                                    <tr>
                                        <th>#</th>
                                        <th>Descripción</th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tipousuarios.length > 0 ? (
                                        [...tipousuarios.slice(0, 10), ...Array(Math.max(0, 10 - tipousuarios.length)).fill(null)].map((v, index) => {
                                            const puedeEditar = v && v.id && v.id != 1;
                                            return (
                                                <tr
                                                    className="text-center align-middle"
                                                    key={v ? v.id : `empty-${index}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (puedeEditar) {
                                                            setTipoUsuarioAGuardar(v);
                                                        }
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    {v ? (
                                                        <>
                                                            <td style={{ width: '60px' }}>{v.id}</td>
                                                            <td className='text-start'>{v.tipousuario}</td>
                                                            <td style={{ width: '100px' }}>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (v.id != 1) {
                                                                            handleEliminarTipoUsuario(v)
                                                                        }
                                                                    }}
                                                                    className="btn border-0 me-2 p-0"
                                                                    style={{ cursor: v.id == 1 ? 'default' : 'pointer' }}
                                                                >
                                                                    <i className={`bi bi-trash-fill ${v.id == 1 ? 'text-danger-emphasis' : 'text-danger'}`}></i>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        agregarAcceso('Visualizar', v.id);
                                                                        setTipoUsuarioAVisualizar(v)
                                                                    }}
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
                                                        </>
                                                    )}
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr className="text-center align-middle">
                                            <td colSpan="3" className="text-center" style={{ height: '325px' }}>
                                                <div className='fw-bolder fs-1'>No hay roles disponibles</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => setTipoUsuarioAGuardar(tipousuarioSelected)} className="btn btn-success text-black fw-bold me-3">
                                <i className="bi bi-plus-lg me-2"></i>Registrar
                            </button>
                            <button onClick={() => refrescar()} className="btn btn-primary text-black fw-bold ms-3">
                                <i className="bi bi-arrow-clockwise me-2"></i>Refrescar
                            </button>
                            <nav aria-label="page navigation" className='user-select-none ms-auto'>
                                <ul className="pagination m-0">
                                    <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                        <button className={`page-link ${page === 0 ? 'rounded-end-0 border-black' : 'text-bg-light rounded-end-0 border-black'}`} onClick={() => handlePageChange(page - 1)}>Anterior</button>
                                    </li>
                                    <li className="page-item disabled">
                                        <button className="page-link text-bg-primary rounded-0 fw-bold border-black">{page + 1}</button>
                                    </li>
                                    <li className={`page-item ${(page === totalPages - 1 || tipousuarios.length === 0) ? 'disabled' : ''}`}>
                                        <button className={`page-link ${(page === totalPages - 1 || tipousuarios.length === 0) ? 'rounded-start-0 border-black' : 'text-bg-light rounded-start-0 border-black'}`} onClick={() => handlePageChange(page + 1)}>Siguiente</button>
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
