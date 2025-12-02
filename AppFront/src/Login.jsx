import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./services/usuario.service";
import { AddAccess } from "./utils/AddAccess.js";

export const Login = ({ setUserLog }) => {

    const navigate = useNavigate();
    const [nombreusuario, setNombreUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombreusuario || !contrasena) {
            setError("Ingrese su nombre de usuario y contraseña.");
            return;
        }

        try {
            setLoading(true);
            const credentials = { nombreusuario, contrasena };
            const response = await login(credentials);

            if (response.ok) {
                const usuarioEncontrado = response.user;

                if (usuarioEncontrado.activo == false) {
                    setError("El usuario está inactivo.");
                    return;
                }

                const expirationTime = Date.now() + 60 * 60 * 1000;
                const sessionData = {
                    user: usuarioEncontrado,
                    expiresAt: expirationTime
                };

                localStorage.setItem('session', JSON.stringify(sessionData));
                sessionStorage.setItem('usuario', JSON.stringify(usuarioEncontrado));

                await AddAccess('Iniciar Sesión', 0, response.user, "Login");

                setUserLog(usuarioEncontrado);
                navigate(-1);
            } else {
                setError("Nombre de usuario o contraseña incorrectos.");
            }
        } catch (error) {
            console.error("Error de login:", error);
            setError("Error al intentar iniciar sesión.");
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <>
            <div className="d-flex justify-content-center align-items-center vh-100 loginBack">
                <div className="rounded-3 p-4 w-75" style={{ boxShadow: '0 0 25px rgba(0, 0, 0, 0.4)' }}>
                    <form
                        className="needs-validation"
                        onSubmit={handleSubmit}
                        autoComplete="off"
                        noValidate
                    >
                        <img src="/logo.svg" className="w-75 my-4" alt="Biotech" />
                        <div className="mt-4">
                            {error && <div className="alert alert-danger p-2">{error}</div>}
                            <div className="mt-3 pb-3 d-flex align-items-center">
                                <i className="bi bi-person-fill me-2 fs-4"></i>
                                <input
                                    type="text"
                                    className="modern-input"
                                    placeholder="Usuario"
                                    value={nombreusuario}
                                    onChange={(e) => setNombreUsuario(e.target.value.toUpperCase())}
                                    maxLength={20}
                                    autoFocus
                                />
                            </div>
                            <div className="mt-5 pb-3 d-flex align-items-center position-relative">
                                <i className="bi bi-key-fill me-2 fs-4"></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="modern-input pe-5"
                                    placeholder="Contraseña"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    maxLength={30}
                                />
                                <button
                                    type="button"
                                    className="btn btn-light btn-eye p-0"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <i className="bi bi-eye-slash-fill"></i>
                                    ) : (
                                        <i className="bi bi-eye-fill"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                type="submit"
                                className="btn btn-success fw-bold px-4 text-black"
                                disabled={loading}
                            >
                                <i className="bi bi-box-arrow-right me-2"></i>{loading ? 'Cargando' : 'Ingresar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Login;