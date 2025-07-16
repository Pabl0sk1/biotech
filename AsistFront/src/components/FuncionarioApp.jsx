import { useState, useEffect } from 'react';
import { getFuncionarioPaginado, saveFuncionario, updateFuncionario, deleteFuncionario, getFuncionarioPorNrodoc, getFuncionarioPorNombre, getFuncionarioPorNrodocYNombre } from '../services/funcionario.service.js';
import { saveAuditoria, getNetworkInfo } from '../services/auditoria.service.js';
import { getCargo } from '../services/cargo.service.js';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';

export const FuncionarioApp = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

    const [nombreBuscado, setNombreBuscado] = useState('');
    const [nrodocBuscado, setNrodocBuscado] = useState('');
    const [funcionarios, setFuncionarios] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [funcionarioAGuardar, setFuncionarioAGuardar] = useState(null);
    const [funcionarioAEliminar, setFuncionarioAEliminar] = useState(null);
    const [funcionarioNoEliminar, setFuncionarioNoEliminar] = useState(null);
    const [funcionarioAVisualizar, setFuncionarioAVisualizar] = useState(null);
    const [sugerencias, setSugerencias] = useState([]);
    const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
    const [cargoMsj, setCargoMsj] = useState('');
    const [cargoError, setCargoError] = useState(false);

    //Cancelar eliminación con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setFuncionarioAEliminar(null);
                setFuncionarioNoEliminar(null);
                setFuncionarioAVisualizar(null);
                setFuncionarioAGuardar(null);
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
            programa: "Funcionarios",
            operacion: op,
            codregistro: cod,
            ip: network.ip,
            equipo: network.equipo
        }
        await saveAuditoria(auditoria);
    }

    const funcionarioSelected = {
        id: null,
        cargo: {
            id: 0
        },
        nombre: "",
        apellido: "",
        nrodoc: "",
        nrotelefono: "",
        salario: 0,
        codigo: 0
    };

    const recuperarFuncionarios = async (pageNumber = 0, nrodoc = '', nombre = '') => {
        const response = await getFuncionarioPaginado(pageNumber);

        // Filtrar funcionarios por rol, nombre y estado en un solo paso
        const funcionariosFiltrados = response.funcionarios.filter(funcionario => {
            const nombreCoincide = nombre.trim() !== '' ? funcionario.nombre.toLowerCase().includes(nombre.toLowerCase()) : true;
            const nrodocCoincide = nrodoc.trim() !== '' ? funcionario.nrodoc.toLowerCase().includes(nrodoc.toLowerCase()) : true;

            return nombreCoincide && nrodocCoincide;
        });

        return {
            funcionarios: funcionariosFiltrados,
            totalPages: response.totalPages,
            currentPage: response.currentPage,
        };
    };

    const recuperarCargos = async () => {
        const response = await getCargo();
        setCargos(response);
    }

    const recuperarNetworkInfo = async () => {
        const response = await getNetworkInfo();
        return response;
    }

    const recuperarFuncionariosConFiltro = async (page) => {
        if (nombreBuscado.trim() === '' && nrodocBuscado.trim() === '') {
            return await recuperarFuncionarios(page, nombreBuscado, nrodocBuscado);
        } else {
            if (nombreBuscado.trim() !== '' && nrodocBuscado !== '') {
                return await getFuncionarioPorNrodocYNombre(nrodocBuscado, nombreBuscado, page);
            } else if (nombreBuscado.trim() !== '') {
                return await getFuncionarioPorNombre(nombreBuscado, page);
            } else if (nrodocBuscado.trim() !== '') {
                return await getFuncionarioPorNrodoc(nrodocBuscado, page);
            }
        }
    }

    useEffect(() => {
        recuperarFuncionarios(page, nrodocBuscado, nombreBuscado);
        recuperarCargos();
    }, []);

    const actualizarFuncionarios = async () => {
        const resultado = await recuperarFuncionariosConFiltro(page);
        setFuncionarios(resultado.funcionarios);
        setTotalPages(resultado.totalPages);
        if (page >= resultado.totalPages) setPage(0);
    }

    useEffect(() => {
        const buscarFuncionarios = async () => {
            try {
                actualizarFuncionarios();
            } catch (error) {
                console.error('Error buscando funcionarios:', error);
            }
        };

        buscarFuncionarios();
    }, [page, nrodocBuscado, nombreBuscado]);

    const eliminarFuncionarioFn = async (id) => {
        try {
            await deleteFuncionario(id);
            agregarAcceso('Eliminar', id);
            actualizarFuncionarios();
        } catch (error) {
            console.error('Error buscando funcionarios:', error);
        }
    };

    const confirmarEliminacion = (id) => {
        eliminarFuncionarioFn(id);
        setFuncionarioAEliminar(null);
    }

    const handleEliminarFuncionario = (funcionario) => {

        setFuncionarioAEliminar(funcionario);
    };

    const guardarFn = async (funcionarioAGuardar) => {

        if (funcionarioAGuardar.id) {
            await updateFuncionario(funcionarioAGuardar.id, funcionarioAGuardar);
            agregarAcceso('Modificar', funcionarioAGuardar.id);
        } else {
            const nuevoFuncionario = await saveFuncionario(funcionarioAGuardar);
            agregarAcceso('Insertar', nuevoFuncionario.id);
        }

        setFuncionarioAGuardar(null);
        actualizarFuncionarios();
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

        let sw = 0;

        // Verificar si está vacío
        if (!funcionarioAGuardar.cargo.cargo || funcionarioAGuardar.cargo.cargo.trim() === '') {
            setCargoMsj('El cargo es obligatorio.');
            setCargoError(true);
            sw = 1;
        } else {
            // Verificar si el cargo seleccionado es válido
            const existe = verificarCargo(funcionarioAGuardar.cargo.cargo);
            if (!existe) {
                setCargoMsj('El cargo es inválido.');
                setCargoError(true);
                sw = 1;
            }
        }

        if (sw === 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...funcionarioAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    const manejarTeclado = (event) => {
        if (event.key === 'ArrowDown') {
            setIndiceSeleccionado((prev) => (prev < sugerencias.length - 1 ? prev + 1 : prev));
        } else if (event.key === 'ArrowUp') {
            setIndiceSeleccionado((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (indiceSeleccionado >= 0) {
                seleccionarTecla(indiceSeleccionado);
            }
        }
    };

    const seleccionarTecla = (index) => {
        const cargoSeleccionado = sugerencias[index];
        setFuncionarioAGuardar({
            ...funcionarioAGuardar,
            cargo: {
                id: cargoSeleccionado.id,
                cargo: cargoSeleccionado.tipoproducto
            }
        });
        handleCargoChange({
            target: {
                name: 'cargo',
                value: cargoSeleccionado.cargo
            }
        });
        setSugerencias([]);
        setIndiceSeleccionado(-1);
    }

    const verificarCargo = (desc) => {
        return cargos.some(p => p.cargo === desc);
    }

    const handleCargoChange = (e) => {
        const nuevoDesc = e.target.value;
        const descEncontrada = cargos.find(p => p.cargo === nuevoDesc);

        setFuncionarioAGuardar({
            ...funcionarioAGuardar,
            cargo: descEncontrada
                ? { id: descEncontrada.id, cargo: descEncontrada.cargo }
                : { id: null, cargo: nuevoDesc }
        });

        const existe = verificarCargo(nuevoDesc);

        if (nuevoDesc.trim() === '') {
            setCargoMsj('El cargo es obligatorio.');
            setCargoError(true);
        } else if (!existe) {
            setCargoMsj('El cargo es inválido.');
            setCargoError(true);
        } else {
            setCargoMsj('');
            setCargoError(false);
        }

        const nuevasSugerencias = cargos
            .filter(p => p.cargo.toLowerCase().includes(nuevoDesc.toLowerCase()))
            .slice(0, 5);
        setSugerencias(nuevoDesc.trim() === '' ? [] : nuevasSugerencias);
    }

    const refrescar = () => {
        setNombreBuscado('');
        setNrodocBuscado('');
    };

    const handleOpenForm = (funcionario) => {
        setFuncionarioAGuardar(funcionario);
        setSugerencias([]);
        setIndiceSeleccionado(-1);
        setCargoMsj('');
        setCargoError(false);
    }

    return (
        <>

            {funcionarioAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-warning alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar el funcionario?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(funcionarioAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setFuncionarioAEliminar(null)}
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

            {funcionarioNoEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-warning alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-database-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>El funcionario está siendo referenciado en otra tabla</p>
                                </div>
                                <button
                                    onClick={() => setFuncionarioNoEliminar(null)}
                                    className="btn btn-danger mt-3 fw-bold text-black">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {funcionarioAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-warning alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col me-5 pe-0'>
                                        <label htmlFor="nombre" className="form-label m-0 mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={funcionarioAVisualizar.nombre}
                                            readOnly
                                        />
                                        <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                        <input
                                            type="text"
                                            id="nrotelefono"
                                            name="nrotelefono"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={funcionarioAVisualizar.nrotelefono}
                                            readOnly
                                        />
                                        <label htmlFor="salario" className="form-label m-0 mb-2">Salario</label>
                                        <NumericFormat
                                            value={funcionarioAVisualizar.salario || 0}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix={'Gs. '}
                                            className="form-control border-input w-100 border-black mb-3"
                                            readOnly
                                        />
                                        <label htmlFor="cargo" className="form-label m-0 mb-2">Cargo</label>
                                        <input
                                            type="text"
                                            id="cargo"
                                            name="cargo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={funcionarioAVisualizar.cargo.cargo}
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
                                            value={funcionarioAVisualizar.apellido}
                                            readOnly
                                        />
                                        <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                        <input
                                            type="text"
                                            id="nrodoc"
                                            name="nrodoc"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={funcionarioAVisualizar.nrodoc}
                                            readOnly
                                        />
                                        <label htmlFor="codigo" className="form-label m-0 mb-2">Código</label>
                                        <NumericFormat
                                            value={funcionarioAVisualizar.codigo || 0}
                                            displayType="text"
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            className="form-control border-input w-100 border-black mb-3"
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setFuncionarioAVisualizar(null)} className="btn btn-danger mt-3 text-black fw-bold">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {funcionarioAGuardar && (
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
                                                    value={funcionarioAGuardar.nombre}
                                                    onChange={(event) => setFuncionarioAGuardar({ ...funcionarioAGuardar, [event.target.name]: event.target.value })}
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
                                                    value={funcionarioAGuardar.nrotelefono}
                                                    onChange={(event) => setFuncionarioAGuardar({ ...funcionarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={15}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="salario" className="form-label m-0 mb-2">Salario</label>
                                                <NumericFormat
                                                    type="text"
                                                    id="salario"
                                                    name="salario"
                                                    className="form-control border-input w-100"
                                                    displayType="input"
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    prefix={'Gs. '}
                                                    value={funcionarioAGuardar.salario === 0 ? 0 : funcionarioAGuardar.salario}
                                                    placeholder='Escribe...'
                                                    min={0}
                                                    onChange={(event) => {
                                                        const value = event.target.value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
                                                        setFuncionarioAGuardar({ ...funcionarioAGuardar, [event.target.name]: value === '' ? '' : parseFloat(value) || 0 })
                                                    }}
                                                    required
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El salario no debe estar vacío.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="cargo" className="form-label m-0 mb-2">Cargo</label>
                                                <input
                                                    type="text"
                                                    id="cargo"
                                                    name="cargo"
                                                    className={`form-control border-input w-100 ${cargoError ? 'is-invalid' : ''}`}
                                                    placeholder='Escribe...'
                                                    value={funcionarioAGuardar.cargo.cargo || ''}
                                                    onChange={handleCargoChange}
                                                    onKeyDown={manejarTeclado}
                                                    onBlur={() => setTimeout(() => setSugerencias([]), 200)}
                                                    onFocus={() => {
                                                        setIndiceSeleccionado(-1);
                                                        if (cargos.length > 0 && funcionarioAGuardar.cargo?.cargo) {
                                                            const nuevasSugerencias = cargos
                                                                .filter(p => p.cargo.toLowerCase().includes(funcionarioAGuardar.cargo.cargo.toLowerCase()))
                                                                .slice(0, 5);
                                                            setSugerencias(nuevasSugerencias);
                                                        }
                                                    }}
                                                    required
                                                />
                                                {sugerencias.length > 0 && (
                                                    <ul
                                                        className="list-group position-absolute"
                                                        style={{ zIndex: 1000 }}
                                                        onMouseDown={(e) => e.preventDefault()} // Evitar que el blur cierre la lista durante el clic
                                                    >
                                                        {sugerencias.map((sugerencia, index) => (
                                                            <li
                                                                key={sugerencia.id}
                                                                className={`list-group-item list-group-item-action ${indiceSeleccionado === index ? 'active' : ''}`}
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => seleccionarTecla(index)}
                                                                onMouseEnter={() => setIndiceSeleccionado(index)}
                                                            >
                                                                {sugerencia.cargo}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>{cargoMsj}
                                                </div>
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
                                                    value={funcionarioAGuardar.apellido}
                                                    onChange={(event) => setFuncionarioAGuardar({ ...funcionarioAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El apellido es obligatorio y no debe sobrepasar los 50 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                                <input
                                                    type="text"
                                                    id="nrodoc"
                                                    name="nrodoc"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={funcionarioAGuardar.nrodoc}
                                                    onChange={(event) => setFuncionarioAGuardar({ ...funcionarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={15}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="codigo" className="form-label m-0 mb-2">Código</label>
                                                <NumericFormat
                                                    type="text"
                                                    id="codigo"
                                                    name="codigo"
                                                    className="form-control border-input w-100"
                                                    displayType="input"
                                                    value={funcionarioAGuardar.codigo === 0 ? 0 : funcionarioAGuardar.codigo}
                                                    placeholder='Escribe...'
                                                    min={0}
                                                    onChange={(event) => {
                                                        const value = event.target.value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
                                                        setFuncionarioAGuardar({ ...funcionarioAGuardar, [event.target.name]: value === '' ? '' : parseFloat(value) || 0 })
                                                    }}
                                                    required
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El código no debe estar vacío.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setFuncionarioAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                            <p className='container m-0 p-0'>FUNCIONARIOS</p>
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
                                <i className="bi bi-patch-plus-fill me-2 text-black"></i>Registros
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Funcionarios
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Funcionarios
                        </p>
                        <div className="p-3">
                            <div className="d-flex align-items-center mb-3 fw-bold">
                                <label htmlFor="nombre" className="form-label m-0">Nombre</label>
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
                                <thead className='table-warning'>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Nro. de documento</th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funcionarios.length > 0 ? (
                                        [...funcionarios.slice(0, 10), ...Array(Math.max(0, 10 - funcionarios.length)).fill(null)].map((v, index) => {
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
                                                            <td className='text-start'>{v.nombre}</td>
                                                            <td className='text-start'>{v.apellido}</td>
                                                            <td className='text-end'>{v.nrodoc}</td>
                                                            <td style={{ width: '100px' }}>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEliminarFuncionario(v);
                                                                    }}
                                                                    className="btn border-0 me-2 p-0"
                                                                >
                                                                    <i className="bi bi-trash-fill text-danger"></i>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        agregarAcceso('Visualizar', v.id);
                                                                        setFuncionarioAVisualizar(v);
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
                                                <div className='fw-bolder fs-1'>No hay funcionarios disponibles</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => handleOpenForm(funcionarioSelected)} className="btn btn-success text-black fw-bold me-3">
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
                                    <li className={`page-item ${(page === totalPages - 1 || funcionarios.length === 0) ? 'disabled' : ''}`}>
                                        <button className={`page-link ${(page === totalPages - 1 || funcionarios.length === 0) ? 'rounded-start-0 border-black' : 'text-bg-light rounded-start-0 border-black'}`} onClick={() => handlePageChange(page + 1)}>Siguiente</button>
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
