import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "./services/usuario.service";
import { saveAuditoria, getNetworkInfo } from './services/auditoria.service.js';

export const Login = ({ setUsuarioUsed }) => {

    const navigate = useNavigate();
    const [nombreusuario, setNombreUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const recuperarNetworkInfo = async () => {
        const response = await getNetworkInfo();
        return response;
    }

    const obtenerFechaHora = async () => {
        const localDate = new Date();

        const dia = String(localDate.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
        const mes = String(localDate.getMonth()).padStart(2, '0'); // Los meses son 0-indexados, así que sumamos 1
        const anio = localDate.getFullYear();
        const hora = String(localDate.getHours() - 3).padStart(2, '0'); // Asegura que la hora tenga 2 dígitos
        const minuto = String(localDate.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan 2 dígitos

        return new Date(anio, mes, dia, hora, minuto);
    };

    const agregarAcceso = async (idx) => {
        const network = await recuperarNetworkInfo();
        const fechahora = await obtenerFechaHora();
        const auditoria = {
            id: null,
            usuario: {
                id: idx
            },
            fechahora: fechahora,
            programa: 'Login',
            operacion: 'Iniciar Sesión',
            codregistro: 0,
            ip: network.ip,
            equipo: network.equipo
        }
        await saveAuditoria(auditoria);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombreusuario || !contrasena) {
            setError("Ingrese su nombre de usuario y contraseña.");
            return;
        }

        try {
            setLoading(true);
            const credentials = { nombreusuario, contrasena };
            const response = await loginUsuario(credentials);

            if (response.ok) {
                // Login exitoso
                const usuarioEncontrado = response.usuario;

                // Verificar estado del usuario (por si acaso no lo validas en el backend)
                if (usuarioEncontrado.estado === 'I') {
                    setError("El usuario está inactivo.");
                    return;
                }

                // Si el estado es 'A' (Activo), continuar con el login
                const expirationTime = Date.now() + 60 * 60 * 1000;
                const sessionData = {
                    user: usuarioEncontrado,
                    expiresAt: expirationTime
                };

                localStorage.setItem('session', JSON.stringify(sessionData));
                sessionStorage.setItem('usuario', JSON.stringify(usuarioEncontrado));

                agregarAcceso(usuarioEncontrado.id);

                setUsuarioUsed(usuarioEncontrado);
                navigate('/fashion/home');
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

    return (
        <>
            <div className="d-flex justify-content-center align-items-center vh-100 loginBack">
                <div className="rounded-3 p-5 w-50 m-auto" style={{ boxShadow: '0 0 25px rgba(0, 0, 0, 0.4)' }}>
                    <form
                        className="needs-validation"
                        onSubmit={handleSubmit}
                        autoComplete="off"
                        noValidate
                    >
                        <img src="/logo.svg" className="w-75 my-5" alt="Maria Mora Atelier" />
                        <div className="mt-4">
                            {error && <div className="alert alert-danger p-2">{error}</div>}
                            <div className="mt-3 pb-3 d-flex align-items-center">
                                <i className="bi bi-person-fill me-2 fs-4"></i>
                                <input
                                    type="text"
                                    className="form-control colorTernario text-black"
                                    placeholder="Ingrese el usuario..."
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
                                    className="form-control colorTernario pe-5 text-black"
                                    placeholder="Ingrese la contraseña..."
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