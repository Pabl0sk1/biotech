import { useState, useEffect } from 'react';
import {
    getUsuario, getUsuarioPaginado, saveUsuario, updateUsuario, deleteUsuario, getUsuarioPorNombre, getUsuarioPorEstado,
    getUsuarioPorNombreYEstado, getUsuarioPorIdRol, getUsuarioPorNombreYEstadoYIdRol, getUsuarioPorNombreYIdRol, getUsuarioPorIdRolYEstado
} from '../services/usuario.service.js';
import { getTipoUsuario } from '../services/tipousuario.service.js'
import { Link } from 'react-router-dom';
import { saveAuditoria, getNetworkInfo } from '../services/auditoria.service.js';

export const UsuarioApp = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

    const [nombreUsuarioBuscado, setNombreUsuarioBuscado] = useState('');
    const [estadoBuscado, setEstadoBuscado] = useState('');
    const [rolBuscado, setRolBuscado] = useState('');
    const [nombreUsuarioMsj, setNombreUsuarioMsj] = useState('');
    const [nombreUsuarioError, setNombreUsuarioError] = useState(false);
    const [newPassMsj, setNewPassMsj] = useState('');
    const [newPassError, setNewPassError] = useState(false);
    const [repeatPassMsj, setRepeatPassMsj] = useState('');
    const [repeatPassError, setRepeatPassError] = useState(false);
    const [repeatPassword, setRepeatPassword] = useState('');
    const [usuariosCompleto, setUsuariosCompleto] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [tipoUsuarios, setTipoUsuarios] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [usuarioAGuardar, setUsuarioAGuardar] = useState(null);
    const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
    const [usuarioNoEliminar, setUsuarioNoEliminar] = useState(null);
    const [usuarioAVisualizar, setUsuarioAVisualizar] = useState(null);
    const [showPasswordNueva, setShowPasswordNueva] = useState(false);
    const [showPasswordRepetir, setShowPasswordRepetir] = useState(false);

    //Cancelar eliminación con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setUsuarioAEliminar(null);
                setUsuarioNoEliminar(null);
                setUsuarioAVisualizar(null);
                setUsuarioAGuardar(null);
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
            programa: "Usuarios",
            operacion: op,
            codregistro: cod,
            ip: network.ip,
            equipo: network.equipo
        }
        await saveAuditoria(auditoria);
    }

    const usuarioSelected = {
        id: null,
        tipousuario: {
            id: 0
        },
        nombreusuario: "",
        contrasena: "",
        nombre: "",
        nrodoc: "",
        nrotelefono: "",
        correo: "",
        direccion: "",
        estado: "A"
    };

    const recuperarUsuarios = async (pageNumber = 0, rol = '', nombre = '', estado = '') => {
        const response = await getUsuarioPaginado(pageNumber);

        // Filtrar usuarios por rol, nombre y estado en un solo paso
        const usuariosFiltrados = response.usuarios.filter(usuario => {
            const rolCoincide = rol ? usuario.tipousuario.id === parseInt(rol) : true;
            const nombreCoincide = nombre.trim() !== '' ? usuario.nombreusuario.toLowerCase().includes(nombre.toLowerCase()) : true;
            const estadoCoincide = estado !== '' ? usuario.estado === estado : true;

            return rolCoincide && nombreCoincide && estadoCoincide;
        });

        return {
            usuarios: usuariosFiltrados,
            totalPages: response.totalPages,
            currentPage: response.currentPage,
        };
    };

    const recuperarUsuariosCompletos = async () => {
        const response = await getUsuario();
        setUsuariosCompleto(response);
    };

    const recuperarTipoUsuarios = async () => {
        const response = await getTipoUsuario();
        setTipoUsuarios(response);
    }

    const recuperarNetworkInfo = async () => {
        const response = await getNetworkInfo();
        return response;
    }

    const recuperarUsuariosConFiltro = async (page) => {
        if (nombreUsuarioBuscado.trim() === '' && estadoBuscado === '' && rolBuscado === '') {
            // Si no hay búsqueda, recuperar todos los usuarios
            return await recuperarUsuarios(page, rolBuscado, nombreUsuarioBuscado, estadoBuscado);
        } else {
            // Si hay búsqueda por nombre, estado y rol
            if (nombreUsuarioBuscado.trim() !== '' && estadoBuscado !== '' && rolBuscado !== '') {
                return await getUsuarioPorNombreYEstadoYIdRol(nombreUsuarioBuscado, estadoBuscado, rolBuscado, page);
            } else if (nombreUsuarioBuscado.trim() !== '' && estadoBuscado !== '') {
                // Búsqueda por nombre y estado
                return await getUsuarioPorNombreYEstado(nombreUsuarioBuscado, estadoBuscado, page);
            } else if (nombreUsuarioBuscado.trim() !== '' && rolBuscado !== '') {
                // Búsqueda por nombre y rol
                return await getUsuarioPorNombreYIdRol(nombreUsuarioBuscado, rolBuscado, page);
            } else if (estadoBuscado !== '' && rolBuscado !== '') {
                // Búsqueda por estado y rol
                return await getUsuarioPorIdRolYEstado(rolBuscado, estadoBuscado, page);
            } else if (nombreUsuarioBuscado.trim() !== '') {
                // Solo buscar por nombre
                return await getUsuarioPorNombre(nombreUsuarioBuscado, page);
            } else if (estadoBuscado !== '') {
                // Solo buscar por estado
                return await getUsuarioPorEstado(estadoBuscado, page);
            } else if (rolBuscado !== '') {
                // Solo buscar por rol
                return await getUsuarioPorIdRol(rolBuscado, page);
            }
        }
    }

    useEffect(() => {
        recuperarUsuarios(page, rolBuscado, nombreUsuarioBuscado, estadoBuscado);
        recuperarUsuariosCompletos();
        recuperarTipoUsuarios();
    }, []);

    const actualizarUsuarios = async () => {
        const resultado = await recuperarUsuariosConFiltro(page);
        setUsuarios(resultado.usuarios);
        setTotalPages(resultado.totalPages);
        if (page >= resultado.totalPages) setPage(0);
    }

    useEffect(() => {
        const buscarUsuarios = async () => {
            try {
                actualizarUsuarios();
            } catch (error) {
                console.error('Error buscando usuarios:', error);
            }
        };

        buscarUsuarios();
    }, [page, rolBuscado, nombreUsuarioBuscado, estadoBuscado]);

    const eliminarUsuarioFn = async (id) => {
        try {
            await deleteUsuario(id);
            agregarAcceso('Eliminar', id);
            await recuperarUsuariosCompletos();
            actualizarUsuarios();
        } catch (error) {
            console.error('Error buscando usuarios:', error);
        }
    };

    const confirmarEliminacion = (id) => {
        eliminarUsuarioFn(id);
        setUsuarioAEliminar(null);
    }

    const handleEliminarUsuario = (usuario) => {

        // if () {
        //     setUsuarioNoEliminar(usuario);
        // } else {
        setUsuarioAEliminar(usuario);
        //}
    };

    const guardarFn = async (usuarioAGuardar) => {
        try {

            if (usuarioAGuardar.id) {
                await updateUsuario(usuarioAGuardar.id, usuarioAGuardar);
                agregarAcceso('Modificar', usuarioAGuardar.id);
            } else {
                const nuevoUsuario = await saveUsuario(usuarioAGuardar);
                agregarAcceso('Insertar', nuevoUsuario.id);
            }

            setUsuarioAGuardar(null);
            await recuperarUsuariosCompletos();

            actualizarUsuarios();
        } catch (error) {
            console.error('Error buscando usuarios:', error);
        }
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

        // Verifica si el campo está vacío
        if (!usuarioAGuardar.nombreusuario || usuarioAGuardar.nombreusuario.trim() === '') {
            setNombreUsuarioMsj('El nombre de usuario es obligatorio y no debe sobrepasar los 20 caracteres.');
            setNombreUsuarioError(true); // Establece el error si está vacío
            sw = 1;
        } else {
            // Verifica si el nombre de usuario ya existe
            const existe = verificarNombreUsuarioExistente(usuarioAGuardar.nombreusuario, usuarioAGuardar.id);
            if (existe) {
                setNombreUsuarioMsj('El nombre de usuario ya existe.');
                setNombreUsuarioError(true); // Establece el error si ya existe
                sw = 1;
            } else {
                setNombreUsuarioMsj('');
                setNombreUsuarioError(false);
            }
        }
        if (!usuarioAGuardar.tipousuario || usuarioAGuardar.tipousuario.id === '') {
            sw = 1;
        }
        if (!usuarioAGuardar.id) {
            if (!usuarioAGuardar.contrasena) {
                setNewPassMsj("La contraseña es obligatoria y no debe sobrepasar los 30 caracteres.");
                setNewPassError(true);
                sw = 1;
            } else if (usuarioAGuardar.contrasena.length < 8) {
                setNewPassMsj("La contraseña debe contener al menos 8 caracteres.");
                setNewPassError(true);
                sw = 1;
            } else {
                setNewPassMsj('');
                setNewPassError(false);
            }
            if (!repeatPassword) {
                setRepeatPassMsj("Debe volver a introducir la contraseña.");
                setRepeatPassError(true);
                sw = 1;
            } else if (usuarioAGuardar.contrasena !== repeatPassword) {
                setRepeatPassMsj("Las contraseñas no coinciden.");
                setRepeatPassError(true);
                sw = 1;
            } else {
                setRepeatPassMsj('');
                setRepeatPassError(false);
            }
        }

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            guardarFn({ ...usuarioAGuardar });
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    // Funciones de estado y estilo
    const obtenerEstadoCompleto = (estado) => {
        return estado === 'A' ? 'Activo' : estado === 'I' ? 'Inactivo' : 'Desconocido';
    };
    const obtenerClaseEstado = (estado) => {
        return estado === 'A' ? 'text-bg-success' : estado === 'I' ? 'text-bg-danger' : '';
    };

    //Verifica un nombre de usuario ya usado
    const verificarNombreUsuarioExistente = (nombreUsuario, id) => {
        return usuariosCompleto.some(usuario => usuario.nombreusuario.toLowerCase() === nombreUsuario.toLowerCase() && usuario.id !== id);
    };

    const refrescar = () => {
        setRolBuscado('');
        setNombreUsuarioBuscado('');
        setEstadoBuscado('');
    };

    const handleOpenForm = (usuario) => {
        setShowPasswordNueva(false);
        setShowPasswordRepetir(false);
        setRepeatPassword('');
        setNewPassMsj('');
        setRepeatPassMsj('');
        setNewPassError(false);
        setRepeatPassError(false);
        setUsuarioAGuardar(usuario);
        setNombreUsuarioMsj(''); // Resetea el mensaje de error
        setNombreUsuarioError(false); // Resetea el estado de error
    };

    return (
        <>

            {usuarioAEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-primary alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>¿Estás seguro de que deseas eliminar al usuario?</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => confirmarEliminacion(usuarioAEliminar.id)}
                                        className="btn btn-success text-black me-4 fw-bold"
                                    >
                                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                                    </button>
                                    <button
                                        onClick={() => setUsuarioAEliminar(null)}
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

            {usuarioNoEliminar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-primary alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-database-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>El usuario está siendo referenciado en otra tabla</p>
                                </div>
                                <button
                                    onClick={() => setUsuarioNoEliminar(null)}
                                    className="btn btn-danger mt-3 fw-bold text-black">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {usuarioAVisualizar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg" style={{ width: '800px' }}>
                            <div className="alert alert-primary alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="row mb-3 fw-semibold text-start">
                                    {/*Columna 1 de visualizar*/}
                                    <div className='col pe-0'>
                                        <label htmlFor="nombreusuario" className="form-label m-0 mb-2">Nombre de Usuario</label>
                                        <input
                                            type="text"
                                            id="nombreusuario"
                                            name="nombreusuario"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.nombreusuario}
                                            readOnly
                                        />
                                        <label htmlFor="nombre" className="form-label m-0 mb-2">Nombre/Apellido</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.nombre}
                                            readOnly
                                        />
                                        <label htmlFor="tipousuario" className="form-label m-0 mb-2">Rol</label>
                                        <input
                                            type="text"
                                            id="tipousuario"
                                            name="tipousuario"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.tipousuario.tipousuario}
                                            readOnly
                                        />
                                        <label htmlFor="nrodoc" className="form-label m-0 mb-2">Nro. de Documento</label>
                                        <input
                                            type="text"
                                            id="nrodoc"
                                            name="nrodoc"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.nrodoc}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 2 de visualizar*/}
                                    <div className='col ms-5 me-5 p-0'>
                                        <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                        <input
                                            type="text"
                                            id="nrotelefono"
                                            name="nrotelefono"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.nrotelefono}
                                            readOnly
                                        />
                                        <label htmlFor="correo" className="form-label m-0 mb-2">Correo</label>
                                        <input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={usuarioAVisualizar.correo}
                                            readOnly
                                        />
                                        <label htmlFor="estado" className="form-label m-0 mb-2">Estado</label>
                                        <input
                                            type="text"
                                            id="estado"
                                            name="estado"
                                            className="form-control border-input w-100 border-black mb-3"
                                            value={obtenerEstadoCompleto(usuarioAVisualizar.estado)}
                                            readOnly
                                        />
                                    </div>
                                    {/*Columna 3 de visualizar*/}
                                    <div className='col ps-0'>
                                        <label htmlFor="direccion" className="form-label m-0 mb-2">Dirección</label>
                                        <textarea
                                            type="text"
                                            id="direccion"
                                            name="direccion"
                                            className="form-control border-input w-100 border-black mb-3"
                                            style={{ resize: 'none', height: '208px' }}
                                            value={usuarioAVisualizar.direccion}
                                            readOnly>
                                        </textarea>
                                    </div>
                                </div>
                                <button onClick={() => setUsuarioAVisualizar(null)} className="btn btn-danger mt-3 text-black fw-bold">
                                    <i className="bi bi-x-lg me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {usuarioAGuardar && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg" style={{ width: '800px' }}>
                            <div className="alert alert-primary alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <form
                                    action="url.ph"
                                    onSubmit={handleSubmit}
                                    className="needs-validation"
                                    noValidate
                                >
                                    <div className="row mb-3 fw-semibold text-start">
                                        {/*Columna 1 de visualizar*/}
                                        <div className='col pe-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nombreusuario" className="form-label m-0 mb-2">Nombre de Usuario</label>
                                                <input
                                                    type="text"
                                                    id="nombreusuario"
                                                    name="nombreusuario"
                                                    className={`form-control border-input w-100 ${nombreUsuarioError ? 'is-invalid' : ''}`}
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.nombreusuario}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value.toUpperCase() })}
                                                    required
                                                    autoFocus
                                                    maxLength={20}
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>{nombreUsuarioMsj}
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nombre" className="form-label m-0 mb-2">Nombre/Apellido</label>
                                                <input
                                                    type="text"
                                                    id="nombre"
                                                    name="nombre"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.nombre}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    required
                                                    maxLength={50}
                                                />
                                                <div className="invalid-feedback text-dangertext-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El nombre es obligatorio y no debe sobrepasar los 50 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="tipousuario" className="form-label m-0 mb-2">Rol</label>
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="tipousuario"
                                                    id='tipousuario'
                                                    value={usuarioAGuardar.tipousuario ? usuarioAGuardar.tipousuario.id : ''}
                                                    onChange={(event) => {
                                                        const selectedTipoUsuario = tipoUsuarios.find(r => r.id === parseInt(event.target.value));
                                                        setUsuarioAGuardar({
                                                            ...usuarioAGuardar,
                                                            tipousuario: selectedTipoUsuario // Cambia esto para que se actualice correctamente
                                                        });
                                                    }}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione un rol...</option>
                                                    {tipoUsuarios.map((tp) => (
                                                        <option key={tp.id} value={tp.id}>{tp.tipousuario}</option>
                                                    ))}
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El rol es obligatorio.
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
                                                    value={usuarioAGuardar.nrodoc}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={15}
                                                />
                                            </div>
                                        </div>
                                        {/*Columna 2 de visualizar*/}
                                        <div className='col ms-5 me-5 p-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="nrotelefono" className="form-label m-0 mb-2">Nro. de Teléfono</label>
                                                <input
                                                    type="text"
                                                    id="nrotelefono"
                                                    name="nrotelefono"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.nrotelefono}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={15}
                                                />
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="correo" className="form-label m-0 mb-2">Correo</label>
                                                <input
                                                    type="email"
                                                    id="correo"
                                                    name="correo"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    value={usuarioAGuardar.correo}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                    required
                                                />
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El correo es obligatorio y no debe sobrepasar los 30 caracteres.
                                                </div>
                                            </div>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="estado" className="form-label m-0 mb-2">Estado</label>
                                                <select
                                                    className="form-select border-input w-100"
                                                    name="estado"
                                                    id='estado'
                                                    value={usuarioAGuardar.estado ? usuarioAGuardar.estado : ''}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    disabled={!usuarioAGuardar.id} // Solo permite edición si el usuario ya tiene ID
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione un estado...</option>
                                                    <option key={1} value={'A'}>Activo</option>
                                                    <option key={2} value={'I'}>Inactivo</option>
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El estado es obligatorio.
                                                </div>
                                            </div>
                                            {usuarioAGuardar.id === null && (
                                                <div className='form-group mb-1'>
                                                    <label htmlFor="contrasena" className="form-label m-0 mb-2">Contraseña</label>
                                                    <div className="d-flex align-items-center position-relative">
                                                        <input
                                                            type={showPasswordNueva ? "text" : "password"}
                                                            id="contrasena"
                                                            name="contrasena"
                                                            className="form-control border-input w-100 pe-5"
                                                            placeholder="Escribe..."
                                                            value={usuarioAGuardar.contrasena}
                                                            onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                            required
                                                            autoComplete='off'
                                                            maxLength={30}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-light btn-eye"
                                                            style={{ marginTop: '7px' }}
                                                            onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                                                        >
                                                            {showPasswordNueva ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                                        </button>
                                                    </div>
                                                    {newPassError && (
                                                        <div className="text-danger text-start mt-1" style={{ fontSize: '14px' }}>
                                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>{newPassMsj}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {/*Columna 3 de visualizar*/}
                                        <div className='col ps-0'>
                                            <div className='form-group mb-1'>
                                                <label htmlFor="direccion" className="form-label m-0 mb-2">Dirección</label>
                                                <textarea
                                                    type="text"
                                                    id="direccion"
                                                    name="direccion"
                                                    className="form-control border-input w-100"
                                                    placeholder="Escribe..."
                                                    style={{ resize: 'none', height: '185px' }}
                                                    value={usuarioAGuardar.direccion}
                                                    onChange={(event) => setUsuarioAGuardar({ ...usuarioAGuardar, [event.target.name]: event.target.value })}
                                                    maxLength={100}>
                                                </textarea>
                                            </div>
                                            {usuarioAGuardar.id === null && (
                                                <div className='form-group mb-1'>
                                                    <label htmlFor="repetircontrasena" className="form-label m-0 mb-2">Repetir Contraseña</label>
                                                    <div className="d-flex align-items-center position-relative">
                                                        <input
                                                            type={showPasswordRepetir ? "text" : "password"}
                                                            id="repetircontrasena"
                                                            name="repetircontrasena"
                                                            className="form-control border-input w-100 pe-5"
                                                            placeholder="Escribe..."
                                                            value={repeatPassword}
                                                            onChange={(event) => setRepeatPassword(event.target.value)}
                                                            autoComplete='new-password'
                                                            maxLength={30}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-light btn-eye"
                                                            style={{ marginTop: '7px' }}
                                                            onClick={() => setShowPasswordRepetir(!showPasswordRepetir)}
                                                        >
                                                            {showPasswordRepetir ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                                        </button>
                                                    </div>
                                                    {repeatPassError && (
                                                        <div className="text-danger text-start mt-1" style={{ fontSize: '14px' }}>
                                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>{repeatPassMsj}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <button type='submit' className="btn btn-success text-black me-4 fw-bold">
                                            <i className='bi bi-floppy-fill me-2'></i>Guardar
                                        </button>
                                        <button onClick={() => setUsuarioAGuardar(null)} className="btn btn-danger ms-4 text-black fw-bold">
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
                <nav className="navbar navbar-expand-lg navbar-light bg-white top-0 position-fixed p-0 z-1 w-100 user-select-none border-3 border-black border-bottom">
                    <div className="d-flex w-100">
                        <div className="col-2 d-flex align-items-center m-0 p-1 ps-3 border-end border-dark border-3">
                            <Link className='p-0 text-black ps-1 pe-1 border-0 menuList d-flex' to={UrlBase + "/home"}>
                                <i className='bi bi-chevron-double-left fs-3' style={{ textShadow: '1px 0 0 black, 0 1px 0 black, -1px 0 0 black, 0 -1px 0 black' }}></i>
                            </Link>
                            <p className='container m-0 p-0'>USUARIOS</p>
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
                                <i className="bi bi-lock-fill me-2 text-black"></i>Seguridad
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Usuarios
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-search me-2 fs-5"></i>Listado de Usuarios
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
                                    value={nombreUsuarioBuscado}
                                    onChange={(e) => setNombreUsuarioBuscado(e.target.value)} // Actualiza el estado al escribir
                                />
                                <label htmlFor="roles" className="form-label m-0">Rol</label>
                                <select
                                    className="form-select me-4 ms-2 border-input"
                                    name="roles"
                                    value={rolBuscado}
                                    onChange={(event) => {
                                        const selectedRole = event.target.value;
                                        setRolBuscado(selectedRole);
                                        // Aquí puedes llamar a la función de búsqueda si deseas que se ejecute inmediatamente al seleccionar un rol
                                    }}
                                >
                                    <option value="" className="bg-secondary-subtle">Seleccione un rol...</option>
                                    {tipoUsuarios.map((role) => (
                                        <option key={role.id} value={role.id}>{role.tipousuario}</option>
                                    ))}
                                </select>
                                <label htmlFor="estado" className="form-label m-0">Estado</label>
                                <select
                                    id="estado"
                                    name="estado"
                                    className="me-4 ms-2 form-select border-input"
                                    value={estadoBuscado}
                                    onChange={(e) => setEstadoBuscado(e.target.value)} // Actualiza el estado al seleccionar
                                >
                                    <option value="">Seleccione un estado...</option>
                                    <option value="A">Activo</option>
                                    <option value="I">Inactivo</option>
                                </select>
                            </div>
                            <table className='table table-bordered table-sm table-hover m-0 border-secondary-subtle'>
                                <thead className='table-secondary'>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre de usuario</th>
                                        <th>Rol</th>
                                        <th>Nombre/Apellido</th>
                                        <th>Estado</th>
                                        <th>Nro. de documento</th>
                                        <th>Nro. de teléfono</th>
                                        <th>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.length > 0 ? (
                                        [...usuarios.slice(0, 10), ...Array(Math.max(0, 10 - usuarios.length)).fill(null)].map((v, index) => {
                                            const puedeEditar = v && v.id && usuarioUsed.id == 1 && usuarioUsed.id != v.id;
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
                                                            <td className='text-start'>{v.nombreusuario}</td>
                                                            <td>{v.tipousuario.tipousuario}</td>
                                                            <td className='text-start'>{v.nombre}</td>
                                                            <td style={{ width: '110px' }}>
                                                                <p className={`text-center mx-auto w-75 ${obtenerClaseEstado(v.estado)} m-0 rounded-2 border border-black`}>
                                                                    {obtenerEstadoCompleto(v.estado)}
                                                                </p>
                                                            </td>
                                                            <td className='text-end'>{v.nrodoc}</td>
                                                            <td>{v.nrotelefono}</td>
                                                            <td style={{ width: '100px' }}>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (v.id != usuarioUsed.id && v.id != 1) {
                                                                            handleEliminarUsuario(v)
                                                                        }
                                                                    }}
                                                                    className="btn border-0 me-2 p-0"
                                                                    style={{ cursor: v.id == usuarioUsed.id || v.id == 1 ? 'default' : 'pointer' }}
                                                                >
                                                                    <i className={`bi bi-trash-fill ${v.id == usuarioUsed.id || v.id == 1 ? 'text-danger-emphasis' : 'text-danger'}`}></i>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        agregarAcceso('Visualizar', v.id);
                                                                        setUsuarioAVisualizar(v)
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
                                                            <td>&nbsp;</td>
                                                            <td>&nbsp;</td>
                                                        </>
                                                    )}
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr className="text-center align-middle">
                                            <td colSpan="8" className="text-center" style={{ height: '325px' }}>
                                                <div className='fw-bolder fs-1'>No hay usuarios disponibles</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-top border-2 border-black pt-2 pb-2 ps-3 pe-3 m-0 user-select-none d-flex align-items-center">
                            <button onClick={() => handleOpenForm(usuarioSelected)} className="btn btn-success text-black fw-bold me-3">
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
                                    <li className={`page-item ${(page === totalPages - 1 || usuarios.length === 0) ? 'disabled' : ''}`}>
                                        <button className={`page-link ${(page === totalPages - 1 || usuarios.length === 0) ? 'rounded-start-0 border-black' : 'text-bg-light rounded-start-0 border-black'}`} onClick={() => handlePageChange(page + 1)}>Siguiente</button>
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
