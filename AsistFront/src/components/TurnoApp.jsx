import { useState, useEffect } from 'react';
import { getTurnoPaginado, getTurnoDetalle, saveTurno, updateTurno, deleteTurno, deleteTurnoDetalle, getTurnoPorTipo } from '../services/turno.service.js';
import { saveAuditoria, getNetworkInfo } from '../services/auditoria.service.js';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';

export const TurnoApp = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

    const [tipoBuscado, setTipoBuscado] = useState('');
    const [turnos, setTurnos] = useState([]);
    const [turnosDetalles, setTurnosDetalles] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [turnoAGuardar, setTurnoAGuardar] = useState(null);
    const [turnoAEliminar, setTurnoAEliminar] = useState(null);
    const [turnoAVisualizar, setTurnoAVisualizar] = useState(null);
    const [detalleNoEliminar, setDetalleNoEliminar] = useState(false);

    //Cancelar eliminación con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (detalleNoEliminar) {
                    setDetalleNoEliminar(false);
                } else {
                    setTurnoAEliminar(null);
                    setTurnoAVisualizar(null);
                    setTurnoAGuardar(null);
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [detalleNoEliminar]);

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
            programa: "Turnos",
            operacion: op,
            codregistro: cod,
            ip: network.ip,
            equipo: network.equipo
        }
        await saveAuditoria(auditoria);
    }

    const turnoSelected = {
        id: null,
        descripcion: "",
        tipo: "",
        horaent: "",
        horasal: "",
        horades: "",
        thoras: 0,
        extporcen: 0,
        turnodetalle: []
    };

    const recuperarTurnos = async (pageNumber = 0, desc = '') => {
        const response = await getTurnoPaginado(pageNumber);
        const turnosFiltrados = response.turnos.filter(turno => {
            const tipoCoincide = desc.trim() !== '' ? turno.tipo.toLowerCase().includes(desc.toLowerCase()) : true;

            return tipoCoincide;
        });

        return {
            turnos: turnosFiltrados,
            totalPages: response.totalPages,
            currentPage: response.currentPage,
        };
    };

    const recuperarTurnosDetalles = async () => {
        const response = await getTurnoDetalle();
        setTurnosDetalles(response);
    }

    const recuperarNetworkInfo = async () => {
        const response = await getNetworkInfo();
        return response;
    }

    const recuperarTurnosConFiltro = async (page) => {
        if (tipoBuscado.trim() === '') {
            return await recuperarTurnos(page, tipoBuscado);
        } else {
            return await getTurnoPorTipo(tipoBuscado, page);
        }
    }

    useEffect(() => {
        recuperarTurnos(page, tipoBuscado);
        recuperarTurnosDetalles();
    }, []);

    const actualizarTurnos = async () => {
        const resultado = await recuperarTurnosConFiltro(page);
        setTurnos(resultado.turnos);
        setTotalPages(resultado.totalPages);
        if (page >= resultado.totalPages) setPage(0);
        await recuperarTurnosDetalles();
    }

    useEffect(() => {
        const buscarTurnos = async () => {
            actualizarTurnos();
        };

        buscarTurnos();
    }, [page, tipoBuscado]);

    const eliminarTurnoFn = async (id) => {
        try {
            await deleteTurno(id);
            agregarAcceso('Eliminar', id);
            actualizarTurnos();
        } catch (error) {
            console.error('Error buscando turnos:', error);
        }
    };

    const confirmarEliminacion = (id) => {
        eliminarTurnoFn(id);
        setTurnoAEliminar(null);
    }

    const guardarFn = async (turnoAGuardar) => {

        // Guardar la turno actualizada
        if (turnoAGuardar.id) {
            await updateTurno(turnoAGuardar.id, { ...turnoAGuardar });
            agregarAcceso('Modificar', turnoAGuardar.id);
        } else {
            const nuevaTurno = await saveTurno({ ...turnoAGuardar });
            agregarAcceso('Insertar', nuevaTurno.id);
        }

        setTurnoAGuardar(null);
        actualizarTurnos();
    };

    // Controla el cambio de página
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity()) {
            guardarFn({ ...turnoAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setTipoBuscado('');
    };

    const handleOpenForm = async (turno) => {
        console.log(turno)
        setTurnoAGuardar(turno);
        actualizarTurnos();
    };

    return (
        <>

            {turnoAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-1 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-2 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-primary alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar el turno?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(turnoAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setTurnoAEliminar(null)}
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

            {detalleNoEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-3 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-4 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-primary alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-clipboard-x-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>El turno debe tener al menos un día marcado</p>
                                </div>
                                <button
                                    onClick={() => setDetalleNoEliminar(false)}
                                    className="btn btn-danger text-black mt-3 fw-bold">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {turnoAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-1 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-2 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-primary alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="descripcion" className="form-label m-0 mb-2">Descripción</label>
                                            <input
                                                type="text"
                                                id="descripcion"
                                                name="descripcion"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.descripcion}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="horaent" className="form-label m-0 mb-2">Horarío de Entrada</label>
                                            <input
                                                type="time"
                                                id="horaent"
                                                name="horaent"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.horaent}
                                                step={1}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="horades" className="form-label m-0 mb-2">Tiempo de Descanso</label>
                                            <input
                                                type="time"
                                                id="horades"
                                                name="horades"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.horades}
                                                step={1}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="extporcen" className="form-label m-0 mb-2">Porcentaje</label>
                                            <input
                                                type="number"
                                                id="extporcen"
                                                name="extporcen"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.extporcen}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="tipo" className="form-label m-0 mb-2">Tipo</label>
                                            <input
                                                type="text"
                                                id="tipo"
                                                name="tipo"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.tipo}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="horasal" className="form-label m-0 mb-2">Horarío de Salida</label>
                                            <input
                                                type="time"
                                                id="horasal"
                                                name="horasal"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.horasal}
                                                step={1}
                                                readOnly
                                            />
                                        </div>
                                        <div className='form-group mb-1'>
                                            <label htmlFor="thoras" className="form-label m-0 mb-2">Total de Horas</label>
                                            <input
                                                type="number"
                                                id="thoras"
                                                name="thoras"
                                                className="form-control border-input w-100 border-black mb-3"
                                                value={turnoAVisualizar.thoras}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setTurnoAVisualizar(null)} className="btn btn-danger mt-3 text-black fw-bold">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {turnoAGuardar && (
                <>
                    <div className="position-fixed top-0 start-0 z-1 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-2 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-primary alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <form
                                    action="url.ph"
                                    onSubmit={handleSubmit}
                                    className="needs-validation"
                                    noValidate
                                >
                                    <div className="row mb-3 fw-semibold text-start">
                                        {/*Columna 1 de visualizar*/}
                                        <div className='col me-5 pe-0'>
                                            <div className="form-group mb-1">
                                                <label htmlFor="descripcion" className="form-label m-0 mb-2">Descripción</label>
                                                <input
                                                    type="text"
                                                    id="descripcion"
                                                    name="descripcion"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={turnoAGuardar.descripcion || ''}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                    autoFocus
                                                    required
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La descripción es obligatoria y no debe sobrepasar los 50 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="horaent" className="form-label m-0 mb-2">Horarío de Entrada</label>
                                                <input
                                                    type="time"
                                                    id="horaent"
                                                    name="horaent"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={turnoAGuardar.horaent || ''}
                                                    step={1}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="horades" className="form-label m-0 mb-2">Tiempo de Descanso</label>
                                                <input
                                                    type="time"
                                                    id="horades"
                                                    name="horades"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={turnoAGuardar.horades || ''}
                                                    step={1}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="extporcen" className="form-label m-0 mb-2">Porcentaje</label>
                                                <input
                                                    type="number"
                                                    id="extporcen"
                                                    name="extporcen"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={turnoAGuardar.extporcen || ''}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="tipo" className="form-label m-0 mb-2">Tipo</label>
                                                <select
                                                    id="tipo"
                                                    name="tipo"
                                                    className="form-select border-input w-100"
                                                    value={turnoAGuardar.tipo ? turnoAGuardar.tipo : ''}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione un tipo...</option>
                                                    <option key={1} value={'Diurno'}>Diurno</option>
                                                    <option key={2} value={'Nocturno'}>Nocturno</option>
                                                    <option key={3} value={'Mixto'}>Mixto</option>
                                                    <option key={4} value={'Mixto Diurno'}>Mixto Diurno</option>
                                                    <option key={5} value={'Mixto Nocturno'}>Mixto Nocturno</option>
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El tipo es obligatorio.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="horasal" className="form-label m-0 mb-2">Horarío de Salida</label>
                                                <input
                                                    type="time"
                                                    id="horasal"
                                                    name="horasal"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={turnoAGuardar.horasal || ''}
                                                    step={1}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="thoras" className="form-label m-0 mb-2">Total de Horas</label>
                                                <input
                                                    type="number"
                                                    id="thoras"
                                                    name="thoras"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={turnoAGuardar.thoras || ''}
                                                    onChange={(event) => setTurnoAGuardar({ ...turnoAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setTurnoAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
                                            <i className="bi bi-x-lg me-2"></i>Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div >
                </>
            )}

            <div className="row-cols-auto w-100 m-0">
                <nav className="navbar navbar-expand-lg navbar-light bg-white top-0 position-fixed p-0 z-0 w-100 user-select-none border-3 border-black border-bottom">
                    <div className="d-flex w-100">
                        <div className="col-2 d-flex align-items-center m-0 p-1 ps-3 border-end border-dark border-3">
                            <Link className='p-0 text-black ps-1 pe-1 border-0 menuList d-flex' to={UrlBase + "/home"}>
                                <i className='bi bi-chevron-double-left fs-3' style={{ textShadow: '1px 0 0 black, 0 1px 0 black, -1px 0 0 black, 0 -1px 0 black' }}></i>
                            </Link>
                            <p className='container m-0 p-0'>TURNOS</p>
                        </div>
                        <div className='d-flex align-items-center ps-3'>
                            <i className='bi bi-person fs-3 me-3'></i>
                            <p className='m-0'>{usuarioUsed.tipousuario.tipousuario}</p>
                        </div>
                        <div className='d-flex align-items-center ms-auto'>
                            <img className="navbar-brand p-0 m-0 me-3" src="/logo.png" alt="Maria Mora Atelier" style={{ width: '120px', height: '40px' }} />
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
                                <i className="bi bi-fingerprint me-2 text-black"></i>Turnos
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Turnos
                        </p>
                        <div className="p-3">
                            <div className="d-flex align-items-center mb-3 fw-bold">
                                <label htmlFor="tipoBsc" className="form-label m-0">Tipo</label>
                                <input
                                    type="text"
                                    id="tipoBsc"
                                    name="tipoBsc"
                                    className="me-4 ms-2 form-control border-input"
                                    placeholder='Escribe...'
                                    value={tipoBuscado}
                                    onChange={(e) => setTipoBuscado(e.target.value)} // Actualiza el estado al escribir
                                />
                            </div>
                            <table className='table table-bordered table-sm table-hover m-0 border-secondary-subtle'>
                                <thead className='table-secondary'>
                                    <tr>
                                        <th>#</th>
                                        <th>Descripción</th>
                                        <th>Tipo</th>
                                        <th>Horarío de Entrada</th>
                                        <th>Horarío de Salida</th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {turnos.length > 0 ? (
                                        [...turnos.slice(0, 10), ...Array(Math.max(0, 10 - turnos.length)).fill(null)].map((v, index) => {
                                            const puedeEditar = v && v.id;
                                            return (
                                                <tr
                                                    className="text-center align-middle"
                                                    key={v ? v.id : `empty-${index}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (puedeEditar) {
                                                            handleOpenForm(v);
                                                        }
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    {v ? (
                                                        <>
                                                            <td style={{ width: '60px' }}>{v.id}</td>
                                                            <td className='text-start'>{v.descripcion}</td>
                                                            <td className='text-start'>{v.tipo}</td>
                                                            <td>{v.horaent}</td>
                                                            <td>{v.horasal}</td>
                                                            <td style={{ width: '100px' }}>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setTurnoAEliminar(v);
                                                                    }}
                                                                    className="btn border-0 me-2 p-0"
                                                                >
                                                                    <i className="bi bi-trash-fill text-danger"></i>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        agregarAcceso('Visualizar', v.id);
                                                                        setTurnoAVisualizar(v)
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
                                            <td colSpan="6" className="text-center" style={{ height: '325px' }}>
                                                <div className='fw-bolder fs-1'>No hay turnos disponibles</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => handleOpenForm(turnoSelected)}
                                className="btn btn-success text-black fw-bold me-3">
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
                                    <li className={`page-item ${(page === totalPages - 1 || turnos.length === 0) ? 'disabled' : ''}`}>
                                        <button className={`page-link ${(page === totalPages - 1 || turnos.length === 0) ? 'rounded-start-0 border-black' : 'text-bg-light rounded-start-0 border-black'}`} onClick={() => handlePageChange(page + 1)}>Siguiente</button>
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
