import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, changePassword } from "./services/usuario.service";
import Header from "./Header";

export const CambiarContrasena = ({ userLog, setUserLog }) => {

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
        navigate(-1);
    };

    const actualizaruserLog = async () => {
        const response = await getUser();
        const usuarioActualizado = response.items.find(u => u.id === userLog.id);

        if (usuarioActualizado) {
            setUserLog(usuarioActualizado);
            const sessionData = JSON.parse(localStorage.getItem('session') || '{}');
            if (sessionData.user) {
                sessionData.user = usuarioActualizado;
                localStorage.setItem('session', JSON.stringify(sessionData));
            }
            sessionStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
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

                const response = await changePassword(userLog.id, {
                    contrasenaActual: formData.contrasenaActual,
                    contrasenaNueva: formData.contrasenaNueva
                });

                if (response.ok) {
                    await actualizaruserLog();
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
                <div className="success-modal">
                    <div className="success-content">
                        <div className="success-icon">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>¡Contraseña Actualizada!</h3>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                            Tu contraseña se ha cambiado correctamente
                        </p>
                        <button
                            onClick={confirmarEscape}
                            className="modern-button btn-primary"
                        >
                            <i className="bi bi-check-lg"></i>
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'CONTRASEÑA'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />

                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        {/* Header de seguridad */}
                        <div className="extend-header">
                            <div className="security-icon">
                                <i className="bi bi-key-fill"></i>
                            </div>
                            <h2 className="m-0" style={{ fontSize: '24px', fontWeight: '700' }}>
                                Contraseña
                            </h2>
                            <p className="m-0 mt-2 opacity-90" style={{ fontSize: '16px' }}>
                                Mantén tu cuenta segura con una contraseña fuerte
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="needs-validation" autoComplete="off" noValidate>
                            <div className="form-body">
                                {/* Contraseña actual */}
                                <div className="modern-input-group">
                                    <label htmlFor="contrasenaActual" className="modern-label">
                                        <i className="bi bi-lock me-2"></i>Contraseña Actual
                                    </label>
                                    <div className="password-input-container">
                                        <input
                                            type={showPasswordActual ? "text" : "password"}
                                            id="contrasenaActual"
                                            name="contrasenaActual"
                                            className={`modern-input ${error ? 'error' : ''}`}
                                            placeholder="Ingresa tu contraseña actual"
                                            maxLength={30}
                                            value={formData.contrasenaActual}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPasswordActual(!showPasswordActual)}
                                        >
                                            {showPasswordActual ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                        </button>
                                    </div>
                                    {error && (
                                        <div className="error-message">
                                            <i className="bi bi-exclamation-triangle-fill"></i>
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Nueva contraseña */}
                                <div className="modern-input-group">
                                    <label htmlFor="contrasenaNueva" className="modern-label">
                                        <i className="bi bi-key me-2"></i>Nueva Contraseña
                                    </label>
                                    <div className="password-input-container">
                                        <input
                                            type={showPasswordNueva ? "text" : "password"}
                                            id="contrasenaNueva"
                                            name="contrasenaNueva"
                                            className={`modern-input ${newPass ? 'error' : ''}`}
                                            placeholder="Crea una contraseña segura"
                                            value={formData.contrasenaNueva}
                                            onChange={handleInputChange}
                                            maxLength={30}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                                        >
                                            {showPasswordNueva ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                        </button>
                                    </div>
                                    {newPass && (
                                        <div className="error-message">
                                            <i className="bi bi-exclamation-triangle-fill"></i>
                                            {newPass}
                                        </div>
                                    )}
                                </div>

                                {/* Confirmar contraseña */}
                                <div className="modern-input-group">
                                    <label htmlFor="contrasenaRepetida" className="modern-label">
                                        <i className="bi bi-check-circle me-2"></i>Confirmar Contraseña
                                    </label>
                                    <div className="password-input-container">
                                        <input
                                            type={showPasswordRepetir ? "text" : "password"}
                                            id="contrasenaRepetida"
                                            name="contrasenaRepetida"
                                            className={`modern-input ${repeatPass ? 'error' : ''}`}
                                            placeholder="Repite tu nueva contraseña"
                                            value={formData.contrasenaRepetida}
                                            onChange={handleInputChange}
                                            maxLength={30}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPasswordRepetir(!showPasswordRepetir)}
                                        >
                                            {showPasswordRepetir ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                                        </button>
                                    </div>
                                    {repeatPass && (
                                        <div className="error-message">
                                            <i className="bi bi-exclamation-triangle-fill"></i>
                                            {repeatPass}
                                        </div>
                                    )}
                                </div>

                                {/* Requisitos de contraseña */}
                                <div className="password-requirements">
                                    <h4 style={{ color: '#92400e', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                                        <i className="bi bi-info-circle-fill me-2"></i>Requisitos de Contraseña
                                    </h4>
                                    <div className="requirement-item">
                                        <i className="bi bi-check-circle-fill" style={{ color: '#10b981' }}></i>
                                        Mínimo 8 caracteres
                                    </div>
                                    <div className="requirement-item">
                                        <i className="bi bi-check-circle-fill" style={{ color: '#10b981' }}></i>
                                        Usa una combinación única de letras, números y símbolos
                                    </div>
                                    <div className="requirement-item">
                                        <i className="bi bi-check-circle-fill" style={{ color: '#10b981' }}></i>
                                        Evita información personal fácil de adivinar
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div style={{
                                background: '#f9fafb',
                                padding: '24px 32px',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '12px'
                            }}>
                                <Link
                                    className="modern-button btn-secondary"
                                    to={-1}
                                >
                                    <i className="bi bi-x-lg"></i>
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    className="modern-button btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <i className="bi bi-check-lg"></i>
                                    )}
                                    {loading ? 'Cambiando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CambiarContrasena;