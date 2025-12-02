import { useState, useEffect } from 'react';
import { getEmployee, saveEmployee, updateEmployee, deleteEmployee } from '../services/funcionario.service.js';
import { getPosition } from '../services/cargo.service.js';
import { getBranch } from '../services/sucursal.service.js';
import { NumericFormat } from 'react-number-format';
import Header from '../Header.jsx';
import { AddAccess } from "../utils/AddAccess.js";
import { FiltroModal } from '../FiltroModal.jsx';
import { DateHourFormat } from '../utils/DateHourFormat.js';

export const FuncionarioApp = ({ userLog }) => {

    const [funcionarios, setFuncionarios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [funcionarioAGuardar, setFuncionarioAGuardar] = useState(null);
    const [funcionarioAEliminar, setFuncionarioAEliminar] = useState(null);
    const [funcionarioNoEliminar, setFuncionarioNoEliminar] = useState(null);
    const [funcionarioAVisualizar, setFuncionarioAVisualizar] = useState(null);
    const [sugerencias, setSugerencias] = useState([]);
    const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
    const [cargoMsj, setCargoMsj] = useState('');
    const [cargoError, setCargoError] = useState(false);
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
        cargo: {
            id: 0
        },
        sucursal: {
            id: 0
        },
        nomape: "",
        nombre: "",
        apellido: "",
        nrodoc: "",
        nrotelefono: "",
        correo: "",
        salario: 0,
        codigo: 0,
        fechanacimiento: ""
    };

    const recuperarFuncionarios = () => {
        setQuery(q => ({ ...q }));
    };

    const recuperarCargos = async () => {
        const response = await getPosition();
        setCargos(response.items);
    }

    const recuperarSucursales = async () => {
        const response = await getBranch();
        setSucursales(response.items);
    }

    useEffect(() => {
        const load = async () => {
            const filtrosFinal = query.filter.join(";");
            const response = await getEmployee(query.page, query.size, query.order, filtrosFinal);
            setFuncionarios(response.items);
            setTotalPages(response.totalPages);
            recuperarCargos();
            recuperarSucursales();
        };
        load();
    }, [query]);

    const eliminarFuncionarioFn = async (id) => {
        await deleteEmployee(id);
        await AddAccess('Eliminar', id, userLog, "Funcionarios");
        recuperarFuncionarios();
    };

    const confirmarEliminacion = (id) => {
        eliminarFuncionarioFn(id);
        setFuncionarioAEliminar(null);
    }

    const handleEliminarFuncionario = (funcionario) => {
        setFuncionarioAEliminar(funcionario);
    };

    const guardarFn = async (funcionarioAGuardar) => {

        const funcionarioActualizado = {
            ...funcionarioAGuardar,
            nomape: funcionarioAGuardar.nombre + ", " + funcionarioAGuardar.apellido,
        };

        if (funcionarioActualizado.id) {
            await updateEmployee(funcionarioActualizado.id, funcionarioActualizado);
            await AddAccess('Modificar', funcionarioActualizado.id, userLog, "Funcionarios");
        } else {
            const nuevoFuncionario = await saveEmployee(funcionarioActualizado);
            await AddAccess('Insertar', nuevoFuncionario.saved.id, userLog, "Funcionarios");
        }
        setFuncionarioAGuardar(null);
        recuperarFuncionarios();
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

        let sw = 0;

        if (!funcionarioAGuardar.sucursal) sw = 1;
        if (!funcionarioAGuardar.cargo.cargo || funcionarioAGuardar.cargo.cargo.trim() === '') {
            setCargoMsj('El cargo es obligatorio.');
            setCargoError(true);
            sw = 1;
        } else {
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
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
    };

    const handleOpenForm = (funcionario) => {
        setFuncionarioAGuardar(funcionario);
        setSugerencias([]);
        setIndiceSeleccionado(-1);
        setCargoMsj('');
        setCargoError(false);
    }

    const rows = [...funcionarios];
    while (rows.length < query.size) rows.push(null);

    return (
        <>

            {funcionarioAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
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
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
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
                                            value={funcionarioAVisualizar.nomape}
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
                                        <label htmlFor="fechanacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            id="fechanacimiento"
                                            name="fechanacimiento"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={funcionarioAVisualizar.fechanacimiento || ''}
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
                                        <label htmlFor="sucursal" className="form-label m-0 mb-2">Sucursal</label>
                                        <input
                                            type="text"
                                            id="sucursal"
                                            name="sucursal"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={funcionarioAVisualizar.sucursal.sucursal || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setFuncionarioAVisualizar(null)} className="btn btn-danger text-black fw-bold mt-1">
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
                                            <div className='form-group mb-1'>
                                                <label htmlFor="fechanacimiento" className="form-label m-0 mb-2">Fecha de Nacimiento</label>
                                                <input
                                                    type="date"
                                                    id="fechanacimiento"
                                                    name="fechanacimiento"
                                                    className="form-control border-input w-100"
                                                    value={funcionarioAGuardar.fechanacimiento || ''}
                                                    onChange={(event) => setFuncionarioAGuardar({ ...funcionarioAGuardar, [event.target.name]: event.target.value })}
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
                                            <div className='form-group mb-1'>
                                                <label htmlFor="sucursal" className="form-label m-0 mb-2">Sucursal</label>
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="sucursal"
                                                    id='sucursal'
                                                    value={funcionarioAGuardar.sucursal ? funcionarioAGuardar.sucursal.id : ''}
                                                    onChange={(event) => {
                                                        const selectedSucursal = sucursales.find(r => r.id === parseInt(event.target.value));
                                                        setFuncionarioAGuardar({
                                                            ...funcionarioAGuardar,
                                                            sucursal: selectedSucursal
                                                        });
                                                    }}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione una sucursal...</option>
                                                    {sucursales.map((tp) => (
                                                        <option key={tp.id} value={tp.id}>{tp.sucursal}</option>
                                                    ))}
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>La sucursal es obligatorio.
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

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'FUNCIONARIOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        <p className="extend-header text-black border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Funcionarios
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
                                        <th onClick={() => toggleOrder("nomape")} className="sortable-header">
                                            Nombre/Apellido
                                            <i className={`bi ${getSortIcon("nomape")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nomape"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nomape",
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
                                        <th onClick={() => toggleOrder("sucursal.sucursal")} className="sortable-header">
                                            Sucursal
                                            <i className={`bi ${getSortIcon("sucursal.sucursal")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["sucursal.sucursal"] ?? {};
                                                    setFiltroActivo({
                                                        field: "sucursal.sucursal",
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
                                        <th onClick={() => toggleOrder("nrodoc")} className="sortable-header">
                                            Nro. de documento
                                            <i className={`bi ${getSortIcon("nrodoc")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["nrodoc"] ?? {};
                                                    setFiltroActivo({
                                                        field: "nrodoc",
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
                                        <th onClick={() => toggleOrder("fechanacimiento")} className="sortable-header">
                                            Fecha de Nacimiento
                                            <i className={`bi ${getSortIcon("fechanacimiento")} ms-2`}></i>
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.target.getBoundingClientRect();
                                                    const previo = filtrosAplicados["fechanacimiento"] ?? {};
                                                    setFiltroActivo({
                                                        field: "fechanacimiento",
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
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funcionarios.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-3 text-muted fs-3 fw-bold">
                                                No hay registros
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.filter(v => v).map((v, index) => {
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
                                                    <td style={{ width: '120px' }}>{v.id}</td>
                                                    <td className='text-start'>{v.nomape}</td>
                                                    <td>{v.sucursal.sucursal}</td>
                                                    <td className='text-end'>{v.nrodoc}</td>
                                                    <td>{DateHourFormat(v.fechanacimiento, 0)}</td>
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
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                await AddAccess('Visualizar', v.id, userLog, "Funcionarios");
                                                                setFuncionarioAVisualizar(v);
                                                            }}
                                                            className="btn border-0 ms-2 p-0"
                                                        >
                                                            <i className="bi bi-eye-fill text-primary p-0"></i>
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
                            <button onClick={() => handleOpenForm(selected)} className="btn btn-secondary fw-bold me-2">
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
                            <nav aria-label="page navigation" className='user-select-none ms-auto'>
                                <ul className="pagination m-0">
                                    <li className={`page-item ${query.page == 0 ? 'disabled' : ''}`}>
                                        <button className={`page-link ${query.page == 0 ? 'rounded-end-0 border-black' : 'text-bg-light rounded-end-0 border-black'}`} onClick={() => prevPage()}>
                                            <i className="bi bi-arrow-left"></i>
                                        </button>
                                    </li>
                                    <li className="page-item disabled">
                                        <button className="page-link text-bg-secondary rounded-0 fw-bold border-black">{query.page + 1} de {totalPages}</button>
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
