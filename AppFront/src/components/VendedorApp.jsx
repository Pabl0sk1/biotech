import { useState, useEffect } from 'react';
import { getVendedorPaginado, saveVendedor, updateVendedor, deleteVendedor, getVendedorPorNrodoc, getVendedorPorNombre, getVendedorPorNrodocYNombre } from '../services/vendedor.service.js';
import { saveAuditoria, getNetworkInfo } from '../services/auditoria.service.js';
import { NumericFormat } from 'react-number-format';
import Header from '../Header.jsx';

export const VendedorApp = ({ usuarioUsed }) => {

    const [nombreBuscado, setNombreBuscado] = useState('');
    const [nrodocBuscado, setNrodocBuscado] = useState('');
    const [vendedores, setVendedores] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [vendedorAGuardar, setVendedorAGuardar] = useState(null);
    const [vendedorAEliminar, setVendedorAEliminar] = useState(null);
    const [vendedorNoEliminar, setVendedorNoEliminar] = useState(null);
    const [vendedorAVisualizar, setVendedorAVisualizar] = useState(null);

    //Cancelar eliminación con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setVendedorAEliminar(null);
                setVendedorNoEliminar(null);
                setVendedorAVisualizar(null);
                setVendedorAGuardar(null);
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
            programa: "Vendedores",
            operacion: op,
            codregistro: cod,
            ip: network.ip,
            equipo: network.equipo
        }
        await saveAuditoria(auditoria);
    }

    const vendedorSelected = {
        id: null,
        nomape: "",
        nombre: "",
        apellido: "",
        nrodoc: "",
        nrotelefono: "",
        fecha_nacimiento: ""
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha + 'T00:00:00Z');
        const day = String(date.getUTCDate()).padStart(2, '0'); // Agrega un cero si es necesario
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    const recuperarVendedores = async (pageNumber = 0, nrodoc = '', nombre = '') => {
        const response = await getVendedorPaginado(pageNumber);

        // Filtrar vendedores
        const vendedoresFiltrados = response.vendedores.filter(vendedor => {
            const nombreCoincide = nombre.trim() !== '' ? vendedor.nombre.toLowerCase().includes(nombre.toLowerCase()) : true;
            const nrodocCoincide = nrodoc.trim() !== '' ? vendedor.nrodoc.toLowerCase().includes(nrodoc.toLowerCase()) : true;

            return nombreCoincide && nrodocCoincide;
        });

        return {
            vendedores: vendedoresFiltrados,
            totalPages: response.totalPages,
            currentPage: response.currentPage,
        };
    };

    const recuperarNetworkInfo = async () => {
        const response = await getNetworkInfo();
        return response;
    }

    const recuperarVendedoresConFiltro = async (page) => {
        if (nombreBuscado.trim() === '' && nrodocBuscado.trim() === '') {
            return await recuperarVendedores(page, nombreBuscado, nrodocBuscado);
        } else {
            if (nombreBuscado.trim() !== '' && nrodocBuscado !== '') {
                return await getVendedorPorNrodocYNombre(nrodocBuscado, nombreBuscado, page);
            } else if (nombreBuscado.trim() !== '') {
                return await getVendedorPorNombre(nombreBuscado, page);
            } else if (nrodocBuscado.trim() !== '') {
                return await getVendedorPorNrodoc(nrodocBuscado, page);
            }
        }
    }

    useEffect(() => {
        recuperarVendedores(page, nrodocBuscado, nombreBuscado);
    }, []);

    const actualizarVendedores = async () => {
        const resultado = await recuperarVendedoresConFiltro(page);
        setVendedores(resultado.vendedores);
        setTotalPages(resultado.totalPages);
        if (page >= resultado.totalPages) setPage(0);
    }

    useEffect(() => {
        const buscarVendedores = async () => {
            try {
                actualizarVendedores();
            } catch (error) {
                console.error('Error buscando vendedores:', error);
            }
        };

        buscarVendedores();
    }, [page, nrodocBuscado, nombreBuscado]);

    const eliminarVendedorFn = async (id) => {
        try {
            await deleteVendedor(id);
            agregarAcceso('Eliminar', id);
            actualizarVendedores();
        } catch (error) {
            console.error('Error buscando vendedores:', error);
        }
    };

    const confirmarEliminacion = (id) => {
        eliminarVendedorFn(id);
        setVendedorAEliminar(null);
    }

    const handleEliminarVendedor = (vendedor) => {

        setVendedorAEliminar(vendedor);
    };

    const guardarFn = async (vendedorAGuardar) => {

        const vendedorActualizado = {
            ...vendedorAGuardar,
            nomape: vendedorAGuardar.nombre + ", " + vendedorAGuardar.apellido,
        };

        if (vendedorActualizado.id) {
            await updateVendedor(vendedorActualizado.id, vendedorActualizado);
            agregarAcceso('Modificar', vendedorActualizado.id);
        } else {
            const nuevoVendedor = await saveVendedor(vendedorActualizado);
            agregarAcceso('Insertar', nuevoVendedor.id);
        }

        setVendedorAGuardar(null);
        actualizarVendedores();
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
            guardarFn({ ...vendedorAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const refrescar = () => {
        setNombreBuscado('');
        setNrodocBuscado('');
    };

    const handleOpenForm = (vendedor) => {
        setVendedorAGuardar(vendedor);
    }

    return (
        <>

            {vendedorAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar el vendedor?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(vendedorAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setVendedorAEliminar(null)}
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

            {vendedorNoEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-database-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>El vendedor está siendo referenciado en otra tabla</p>
                                </div>
                                <button
                                    onClick={() => setVendedorNoEliminar(null)}
                                    className="btn btn-danger mt-3 fw-bold text-black">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {vendedorAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <label htmlFor="nombre" className="form-label m-0 mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={vendedorAVisualizar.nomape}
                                            readOnly
                                        />
                                        <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                        <input
                                            type="text"
                                            id="nrotelefono"
                                            name="nrotelefono"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={vendedorAVisualizar.nrotelefono}
                                            readOnly
                                        />
                                        <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                        <input
                                            type="text"
                                            id="nrodoc"
                                            name="nrodoc"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={vendedorAVisualizar.nrodoc}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 ps-0'>
                                        <label htmlFor="apellido" className="form-label m-0 mb-2">Apellido</label>
                                        <input
                                            type="text"
                                            id="apellido"
                                            name="apellido"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={vendedorAVisualizar.apellido}
                                            readOnly
                                        />
                                        <label htmlFor="fecha_nacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            id="fecha_nacimiento"
                                            name="fecha_nacimiento"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={vendedorAVisualizar.fecha_nacimiento || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setVendedorAVisualizar(null)} className="btn btn-danger mt-3 text-black fw-bold">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {vendedorAGuardar && (
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
                                                <label htmlFor="nombre" className="form-label m-0 mb-2">Nombre</label>
                                                <input
                                                    type="text"
                                                    id="nombre"
                                                    name="nombre"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={vendedorAGuardar.nombre}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    autoFocus
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El nombre es obligatorio y no debe sobrepasar los 50 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                                <input
                                                    type="text"
                                                    id="nrotelefono"
                                                    name="nrotelefono"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={vendedorAGuardar.nrotelefono}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={15}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                                <input
                                                    type="text"
                                                    id="nrodoc"
                                                    name="nrodoc"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={vendedorAGuardar.nrodoc}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={15}
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="apellido" className="form-label m-0 mb-2">Apellido</label>
                                                <input
                                                    type="text"
                                                    id="apellido"
                                                    name="apellido"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={vendedorAGuardar.apellido}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El apellido es obligatorio y no debe sobrepasar los 50 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="fecha_nacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                                <input
                                                    type="date"
                                                    id="fecha_nacimiento"
                                                    name="fecha_nacimiento"
                                                    className="form-control border-input w-100"
                                                    value={vendedorAGuardar.fecha_nacimiento || ''}
                                                    onChange={(event) => setVendedorAGuardar({ ...vendedorAGuardar, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setVendedorAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <Header usuarioUsed={usuarioUsed} title={'VENDEDORES'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />

                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Vendedores
                        </p>
                        <div className="p-3">
                            <div className="d-flex align-items-center mb-3 fw-bold">
                                <label htmlFor="nombre" className="form-label m-0">Nombre/Apellido</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    className="me-4 ms-2 form-control border-input"
                                    placeholder='Escribe...'
                                    value={nombreBuscado}
                                    onChange={(e) => setNombreBuscado(e.target.value)} // Actualiza el estado al escribir
                                />
                                <label htmlFor="nrodoc" className="form-label m-0">Nro. de documento</label>
                                <input
                                    type="text"
                                    id="nrodoc"
                                    name="nrodoc"
                                    className="me-4 ms-2 form-control border-input"
                                    placeholder='Escribe...'
                                    value={nrodocBuscado}
                                    onChange={(e) => setNrodocBuscado(e.target.value)} // Actualiza el estado al escribir
                                />
                            </div>
                            <table className='table table-bordered table-sm table-hover m-0 border-secondary-subtle'>
                                <thead className='table-success'>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre/Apellido</th>
                                        <th>Nro. de documento</th>
                                        <th>Fecha de Nacimiento</th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendedores.length > 0 ? (
                                        [...vendedores.slice(0, 10), ...Array(Math.max(0, 10 - vendedores.length)).fill(null)].map((v, index) => {
                                            const puedeEditar = v && v.id;
                                            return (
                                                <tr
                                                    className="text-center align-middle"
                                                    key={v ? v.id : `empty-${index}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (puedeEditar) handleOpenForm(v);
                                                    }}
                                                    style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                                                >
                                                    {v ? (
                                                        <>
                                                            <td style={{ width: '60px' }}>{v.id}</td>
                                                            <td className='text-start'>{v.nomape}</td>
                                                            <td className='text-end'>{v.nrodoc}</td>
                                                            <td>{formatearFecha(v.fecha_nacimiento)}</td>
                                                            <td style={{ width: '100px' }}>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEliminarVendedor(v);
                                                                    }}
                                                                    className="btn border-0 me-2 p-0"
                                                                >
                                                                    <i className="bi bi-trash-fill text-danger"></i>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        agregarAcceso('Visualizar', v.id);
                                                                        setVendedorAVisualizar(v);
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
                                                        </>
                                                    )}
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr className="text-center align-middle">
                                            <td colSpan="5" className="text-center" style={{ height: '325px' }}>
                                                <div className='fw-bolder fs-1'>No hay vendedores disponibles</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => handleOpenForm(vendedorSelected)} className="btn btn-success text-black fw-bold me-3">
                                <i className="bi bi-plus-lg me-2"></i>Registrar
                            </button>
                            <button onClick={() => refrescar()} className="btn btn-warning text-black fw-bold ms-3">
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
                                    <li className={`page-item ${(page === totalPages - 1 || vendedores.length === 0) ? 'disabled' : ''}`}>
                                        <button className={`page-link ${(page === totalPages - 1 || vendedores.length === 0) ? 'rounded-start-0 border-black' : 'text-bg-light rounded-start-0 border-black'}`} onClick={() => handlePageChange(page + 1)}>Siguiente</button>
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
