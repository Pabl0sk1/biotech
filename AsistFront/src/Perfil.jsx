import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUsuario, updateUsuario } from "./services/usuario.service";
import { useNavigate } from "react-router-dom";

export const Perfil = ({ usuarioUsed, setUsuarioUsed }) => {
    const UrlBase = '/asist';

    const [usuarios, setUsuarios] = useState([]);
    const [data, setData] = useState(usuarioUsed);
    const [nombreUsuarioMsj, setNombreUsuarioMsj] = useState('');
    const [nombreUsuarioError, setNombreUsuarioError] = useState(false);
    const [nombreError, setNombreError] = useState(false);
    const [correoError, setCorreoError] = useState(false);
    const [cerrarPerfil, setCerrarPerfil] = useState(false);
    const navigate = useNavigate();

    //Cancelar eliminación con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (cerrarPerfil) { // Verifica si la ventana de confirmación está abierta
                    confirmarEscape();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [cerrarPerfil]);

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

    const confirmarEscape = () => {
        setCerrarPerfil(false);
        navigate('/asist/home');
    };

    const recuperarUsuarios = async () => {
        const response = await getUsuario();
        setUsuarios(response);
    }

    useEffect(() => {
        recuperarUsuarios();
    }, []);

    const actualizarUsuarioUsed = async () => {
        try {
            const response = await getUsuario();
            const usuarioActualizado = response.find(u => u.id === usuarioUsed.id);
            if (usuarioActualizado) {
                setUsuarioUsed(usuarioActualizado);

                // Actualizar también la sesión
                const sessionData = JSON.parse(localStorage.getItem('session') || '{}');
                if (sessionData.user) {
                    sessionData.user = usuarioActualizado;
                    localStorage.setItem('session', JSON.stringify(sessionData));
                }
                sessionStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
            }
        } catch (error) {
            console.error("Error al actualizar datos del usuario:", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        let sw = 0;

        // Verifica si el campo está vacío
        if (!data.nombreusuario) {
            setNombreUsuarioMsj('El nombre de usuario es obligatorio y no debe sobrepasar los 20 caracteres.');
            setNombreUsuarioError(true); // Establece el error si está vacío
            sw = 1;
        } else {
            // Verifica si el nombre de usuario ya existe
            const existeNombreUsuario = verificarNombreUsuarioExistente(data.nombreusuario, data.id);
            if (existeNombreUsuario) {
                setNombreUsuarioMsj('El nombre de usuario ya existe.');
                setNombreUsuarioError(true); // Establece el error si ya existe
                sw = 1;
            } else {
                setNombreUsuarioMsj('');
                setNombreUsuarioError(false); // Resetea el error si no existe
            }
        }

        if (!data.nombre) {
            setNombreError(true);
            sw = 1;
        } else {
            setNombreError(false);
        }

        if (!data.correo) {
            setCorreoError(true);
            sw = 1;
        } else {
            setCorreoError(false);
        }

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            await updateUsuario(data.id, data);
            await actualizarUsuarioUsed();
            setCerrarPerfil(true);
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    //Verifica un nombre de usuario ya usado
    const verificarNombreUsuarioExistente = (nombreUsuario, id) => {
        return usuarios.some(usuario => usuario.nombreusuario.toLowerCase() === nombreUsuario.toLowerCase() && usuario.id !== id);
    };

    return (
        <>

            {cerrarPerfil && (
                <>
                    <div className="position-fixed top-0 start-0 z-4 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-7 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-check-circle-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>Usuario editado correctamente</p>
                                </div>
                                <button
                                    onClick={() => confirmarEscape()}
                                    className="btn btn-danger mt-3 fw-bold text-black">
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
                            <p className='container m-0 p-0'>PERFIL</p>
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
                                <i className="bi bi-person-circle me-2 text-black"></i>Perfil
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-pencil-square me-2 fs-5"></i>Edición del Perfil del Usuario
                        </p>
                        <form
                            action="url.ph"
                            onSubmit={handleSubmit}
                            className="needs-validation"
                            noValidate
                        >
                            <div className="p-3 pt-5 pb-5 fw-semibold text-start">
                                <div className="input-group">
                                    <label htmlFor="nombreusuario" className="form-label m-0">Nombre de Usuario</label>
                                    <input
                                        type="text"
                                        id="nombreusuario"
                                        name="nombreusuario"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={data.nombreusuario}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value.toUpperCase() })}
                                        maxLength={20}
                                    />
                                    <div className={`invalid-feedback text-danger text-start ${nombreUsuarioError ? 'contents' : 'd-none'}`}>
                                        <i className="bi bi-exclamation-triangle-fill m-2"></i>{nombreUsuarioMsj}
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="nombre" className="form-label m-0">Nombre/Apellido</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={data.nombre}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                        maxLength={50}
                                    />
                                    <div className={`invalid-feedback text-danger text-start ${nombreError ? 'contents' : 'd-none'}`}>
                                        <i className="bi bi-exclamation-triangle-fill m-2"></i>El nombre es obligatorio y no debe sobrepasar los 50 caracteres.
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="nrodoc" className="form-label m-0">Nro. de Documento</label>
                                    <input
                                        type="text"
                                        id="nrodoc"
                                        name="nrodoc"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={data.nrodoc}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                        maxLength={15}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="nrotelefono" className="form-label m-0">Nro. de Teléfono</label>
                                    <input
                                        type="text"
                                        id="nrotelefono"
                                        name="nrotelefono"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={data.nrotelefono}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                        maxLength={15}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="correo" className="form-label m-0">Correo</label>
                                    <input
                                        type="text"
                                        id="correo"
                                        name="correo"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={data.correo}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                        maxLength={30}
                                    />
                                    <div className={`invalid-feedback text-danger text-start ${correoError ? 'contents' : 'd-none'}`}>
                                        <i className="bi bi-exclamation-triangle-fill m-2"></i>El correo es obligatorio y no debe sobrepasar los 30 caracteres.
                                    </div>
                                </div>
                                <div className="input-group mb-0">
                                    <label htmlFor="direccion" className="form-label m-0">Dirección</label>
                                    <textarea
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        style={{ height: '90px', resize: 'none' }}
                                        value={data.direccion}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                        maxLength={100}>
                                    </textarea>
                                </div>
                            </div>
                            <div className="border-top border-2 border-black pt-2 pb-2 ps-3 m-0 text-start user-select-none">
                                <button className="btn btn-primary me-4 fw-bold ps-3 pe-3 text-black">
                                    <i className="bi bi-floppy-fill me-2"></i>Guardar
                                </button>
                                <Link className="btn btn-danger fw-bold text-black" to={UrlBase + '/home'}>
                                    <i className="bi bi-x-lg me-2"></i>Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Perfil;
