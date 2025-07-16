import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsuario, cambiarContrasena } from "./services/usuario.service";

export const CambiarContrasena = ({ usuarioUsed, setUsuarioUsed }) => {
    const UrlBase = '/asist';

    const [showPasswordActual, setShowPasswordActual] = useState(false);
    const [showPasswordNueva, setShowPasswordNueva] = useState(false);
    const [showPasswordRepetir, setShowPasswordRepetir] = useState(false);
    const [cerrarPass, setCerrarPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newPass, setNewPass] = useState("");
    const [repeatPass, setRepeatPass] = useState("");
    const [formData, setFormData] = useState({
        contrasenaActual: "",
        contrasenaNueva: "",
        contrasenaRepetida: ""
    });
    const navigate = useNavigate();

    //Cancelar con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (cerrarPass) {
                    confirmarEscape();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [cerrarPass]);

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
        setCerrarPass(false);
        navigate('/asist/home');
    };

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        let sw = 0;

        // Limpiar mensaje de error previo
        setError("");
        setNewPass("");
        setRepeatPass("");

        if (!formData.contrasenaActual) {
            setError("Debe introducir la contraseña actual.");
            sw = 1;
        }
        if (!formData.contrasenaNueva) {
            setNewPass("Debe introducir la contraseña nueva.");
            sw = 1;
        } else if (formData.contrasenaNueva.length < 8) {
            setNewPass("Debe contener al menos 8 caracteres.");
            sw = 1;
        }
        if (!formData.contrasenaRepetida) {
            setRepeatPass("Debe repetir la contraseña nueva.");
            sw = 1;
        } else if (formData.contrasenaNueva !== formData.contrasenaRepetida) {
            setRepeatPass("Las contraseñas nuevas no coinciden.");
            sw = 1;
        } else if (formData.contrasenaNueva.length < 8) {
            setRepeatPass("Debe contener al menos 8 caracteres.");
            sw = 1;
        }

        if (sw == 1) return;

        if (form.checkValidity()) {
            try {
                setLoading(true);

                // Enviar datos al backend para verificar y cambiar la contraseña
                const response = await cambiarContrasena(usuarioUsed.id, {
                    contrasenaActual: formData.contrasenaActual,
                    contrasenaNueva: formData.contrasenaNueva
                });

                if (response.ok) {
                    // Éxito - la contraseña fue cambiada
                    await actualizarUsuarioUsed();
                    setCerrarPass(true);
                    form.reset();
                    setFormData({
                        contrasenaActual: "",
                        contrasenaNueva: "",
                        contrasenaRepetida: ""
                    });
                    form.classList.remove('was-validated');
                } else {
                    setError("Contraseña incorrecta.");
                }
            } catch (error) {
                console.error("Error al cambiar contraseña:", error);
            } finally {
                setLoading(false);
            }
        } else {
            form.classList.add('was-validated');
        }
    };

    return (
        <>
            {cerrarPass && (
                <>
                    <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-check-circle-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>Contraseña modificada correctamente</p>
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
                            <p className='container m-0 p-0'>CONTRASEÑA</p>
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
                                <i className="bi bi-key-fill me-2 text-black"></i>Contraseña
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-pencil-square me-2 fs-5"></i>Modificar Contraseña
                        </p>
                        <form
                            onSubmit={handleSubmit}
                            className="needs-validation"
                            autoComplete="off"
                            noValidate
                        >
                            <div className="p-3 pt-5 pb-5 fw-semibold text-start">
                                <label htmlFor="contrasenaActual" className="form-label mb-2">Introduzca su contraseña actual</label>
                                <div className="d-flex align-items-center position-relative">
                                    <input
                                        type={showPasswordActual ? "text" : "password"}
                                        id="contrasenaActual"
                                        name="contrasenaActual"
                                        className="form-control border-input pe-5"
                                        placeholder="Escribe..."
                                        maxLength={30}
                                        value={formData.contrasenaActual}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-light btn-eyeChange"
                                        onClick={() => setShowPasswordActual(!showPasswordActual)}
                                    >
                                        {showPasswordActual ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                    </button>
                                </div>
                                {error && (
                                    <div className="text-danger text-start mt-1" style={{ fontSize: '14px' }}>
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                                    </div>
                                )}

                                <label htmlFor="contrasenaNueva" className="form-label mb-2 mt-4">Introduzca su contraseña nueva</label>
                                <div className="d-flex align-items-center position-relative">
                                    <input
                                        type={showPasswordNueva ? "text" : "password"}
                                        id="contrasenaNueva"
                                        name="contrasenaNueva"
                                        className="form-control border-input pe-5"
                                        placeholder="Escribe..."
                                        value={formData.contrasenaNueva}
                                        onChange={handleInputChange}
                                        maxLength={30}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-light btn-eyeChange"
                                        onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                                    >
                                        {showPasswordNueva ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                    </button>
                                </div>
                                {newPass && (
                                    <div className="text-danger text-start mt-1" style={{ fontSize: '14px' }}>
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>{newPass}
                                    </div>
                                )}

                                <label htmlFor="contrasenaRepetida" className="form-label mb-2 mt-4">Repita su contraseña nueva</label>
                                <div className="d-flex align-items-center position-relative">
                                    <input
                                        type={showPasswordRepetir ? "text" : "password"}
                                        id="contrasenaRepetida"
                                        name="contrasenaRepetida"
                                        className="form-control border-input pe-5"
                                        placeholder="Escribe..."
                                        value={formData.contrasenaRepetida}
                                        onChange={handleInputChange}
                                        maxLength={30}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-light btn-eyeChange"
                                        onClick={() => setShowPasswordRepetir(!showPasswordRepetir)}
                                    >
                                        {showPasswordRepetir ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                    </button>
                                </div>
                                {repeatPass && (
                                    <div className="text-danger text-start mt-1" style={{ fontSize: '14px' }}>
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>{repeatPass}
                                    </div>
                                )}
                            </div>

                            <div className="border-top border-2 border-black pt-2 pb-2 ps-3 m-0 text-start user-select-none">
                                <button
                                    type="submit"
                                    className="btn btn-primary me-4 fw-bold ps-3 pe-3 text-black"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-floppy-fill me-2"></i>Guardar
                                        </>
                                    )}
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

export default CambiarContrasena;