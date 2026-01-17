import { useState, useEffect } from "react";
import { getUser, updateUser, updateUserImage, deleteUserImage } from "./services/usuario.service";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { HostLocation } from './utils/HostLocation';
import Loading from "./layouts/Loading";
import Close from "./layouts/Close";

export const Perfil = ({ userLog, setUserLog }) => {

    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [data, setData] = useState(userLog);
    const [nombreUsuarioMsj, setNombreUsuarioMsj] = useState('');
    const [nombreUsuarioError, setNombreUsuarioError] = useState(false);
    const [nombreError, setNombreError] = useState(false);
    const [close, setClose] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [eliminarImagen, setEliminarImagen] = useState(false);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (close) {
                    confirmarEscape();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [close]);

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
        setClose(false);
        if (!nombreUsuarioError && !nombreError) navigate(-1);
    };

    const recuperarUsuarios = async () => {
        const response = await getUser();
        setUsuarios(response.items);

        const BACKEND_URL = HostLocation(1);
        if (userLog?.imagenurl) setImagenSeleccionada(BACKEND_URL + "/biotech" + userLog?.imagenurl);
    }

    useEffect(() => {
        recuperarUsuarios();
    }, []);

    const actualizaruserLog = async () => {
        const response = await getUser();
        const usuarioActualizado = response.items.find(u => u.id === userLog?.id);

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setLoading(true);

        let apellido = "";
        if (data.apellido) apellido = ", " + data.apellido;

        const newData = {
            ...data,
            nomape: data.nombre + apellido,
        };

        let sw = 0;
        if (!newData.nombreusuario) {
            setNombreUsuarioMsj('El nombre de usuario es obligatorio y no debe sobrepasar los 50 caracteres.');
            setNombreUsuarioError(true);
            sw = 1;
        } else {
            const existeNombreUsuario = verificarNombreUsuarioExistente(newData.nombreusuario, newData.id);
            if (existeNombreUsuario) {
                setNombreUsuarioMsj('El nombre de usuario ya existe.');
                setNombreUsuarioError(true);
                sw = 1;
            } else {
                setNombreUsuarioMsj('');
                setNombreUsuarioError(false);
            }
        }
        if (!newData.nombre) {
            setNombreError(true);
            sw = 1;
        } else setNombreError(false);

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            setLoading(false);
            return;
        }

        if (form.checkValidity()) {
            if (eliminarImagen && !imagenFile) {
                await deleteUserImage(newData.id);
                setEliminarImagen(false);
            }

            await updateUser(newData.id, newData);

            if (imagenFile) {
                const formData = new FormData();
                formData.append("imagen", imagenFile);

                if (newData.imagenurl) {
                    formData.append("imagenAnterior", newData.imagenurl);
                }

                await updateUserImage(newData.id, formData);
            }

            await actualizaruserLog();

            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
        setLoading(false);
        setClose(true);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setImagenFile(file);
        setEliminarImagen(false);
        setData(prev => ({
            ...prev,
            imagennombre: file.name,
            imagentipo: file.type
        }));
        const reader = new FileReader();

        reader.onloadend = () => {
            setImagenSeleccionada(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const verificarNombreUsuarioExistente = (nombreUsuario, id) => {
        return usuarios.some(u => u.nombreusuario.toLowerCase() === nombreUsuario.toLowerCase() && u.id !== id);
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {close && (
                <Close confirmar={confirmarEscape} title={'Perfil'} gen={true} />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'PERFIL'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        {/* Header del perfil */}
                        <div className="extend-header">
                            <div className="profile-avatar">
                                <i className="bi bi-person-fill"></i>
                            </div>
                            <h2 className="profile-name">
                                {data.nombre + " " + data.apellido}
                            </h2>
                            <p className="profile-role">
                                @{data.nombreusuario}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                            <div className="form-body">
                                {/* Profile picture Section */}
                                <div className="modern-input-group">
                                    <label className="modern-label">
                                        <i className="bi bi-image me-2"></i>Foto
                                    </label>
                                    <div
                                        className={`image-upload ${imagenSeleccionada ? 'has-image' : ''}`}
                                        onClick={() => document.getElementById('fileInput').click()}
                                    >
                                        {imagenSeleccionada ? (
                                            <>
                                                <img
                                                    src={imagenSeleccionada}
                                                    alt="Vista previa"
                                                    className="image-preview"
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-image"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImagenFile(null);
                                                        setImagenSeleccionada(null);
                                                        setEliminarImagen(true);
                                                        setData({ ...data, imagennombre: "", imagentipo: "", imagenurl: "" });
                                                    }}
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <div>
                                                <div className="upload-icon">
                                                    <i className="bi bi-cloud-upload"></i>
                                                </div>
                                                <div className="upload-text">
                                                    <strong>Hacer clic para subir</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        name="imagen"
                                        accept="image/*"
                                        className="d-none"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                <h3 className="section-title">
                                    <i className="bi bi-shield-check input-icon"></i>
                                    Información de Cuenta
                                </h3>
                                {/* Sección de Información de Cuenta */}
                                <div className="form-section">
                                    <div className="modern-input-group">
                                        <label htmlFor="nombreusuario" className="modern-label">
                                            <i className="bi bi-person-badge me-2"></i>Nombre de Usuario *
                                        </label>
                                        <input
                                            type="text"
                                            id="nombreusuario"
                                            name="nombreusuario"
                                            placeholder="Ingresa tu nombre de usuario"
                                            className={`modern-input ${nombreUsuarioError ? 'error' : ''}`}
                                            value={data.nombreusuario}
                                            onChange={(event) => setData({ ...data, [event.target.name]: event.target.value.toUpperCase() })}
                                            maxLength={50}
                                        />
                                        {nombreUsuarioError && (
                                            <div className="error-message">
                                                <i className="bi bi-exclamation-triangle-fill"></i>
                                                {nombreUsuarioMsj}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="section-title">
                                    <i className="bi bi-person input-icon"></i>
                                    Información Personal
                                </h3>
                                {/* Sección de Información Personal */}
                                <div className="form-section">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="modern-input-group">
                                                <label htmlFor="nombre" className="modern-label">
                                                    <i className="bi bi-card-text me-2"></i>Nombre *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="nombre"
                                                    name="nombre"
                                                    placeholder="Ingresa tu nombre"
                                                    className={`modern-input ${nombreError ? 'error' : ''}`}
                                                    value={data.nombre || ''}
                                                    onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                                    maxLength={150}
                                                />
                                                {nombreError && (
                                                    <div className="error-message">
                                                        <i className="bi bi-exclamation-triangle-fill"></i>
                                                        El nombre es obligatorio (máx. 150 caracteres)
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="modern-input-group">
                                                <label htmlFor="apellido" className="modern-label">
                                                    <i className="bi bi-card-text me-2"></i>Apellido
                                                </label>
                                                <input
                                                    type="text"
                                                    id="apellido"
                                                    name="apellido"
                                                    placeholder="Ingresa tu apellido"
                                                    className="modern-input"
                                                    value={data.apellido || ''}
                                                    onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                                    maxLength={150}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="modern-input-group">
                                                <label htmlFor="nrodoc" className="modern-label">
                                                    <i className="bi bi-credit-card me-2"></i>Número de Documento
                                                </label>
                                                <input
                                                    type="text"
                                                    id="nrodoc"
                                                    name="nrodoc"
                                                    placeholder="Ej: 12345678"
                                                    className="modern-input"
                                                    value={data.nrodoc}
                                                    onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="modern-input-group">
                                                <label htmlFor="fechanacimiento" className="modern-label">
                                                    <i className="bi bi-calendar me-2"></i>Fecha de Nacimiento
                                                </label>
                                                <input
                                                    type="date"
                                                    id="fechanacimiento"
                                                    name="fechanacimiento"
                                                    className="modern-input"
                                                    value={data.fechanacimiento || ''}
                                                    onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="section-title">
                                    <i className="bi bi-telephone input-icon"></i>
                                    Información de Contacto
                                </h3>
                                {/* Sección de Contacto */}
                                <div className="form-section">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="modern-input-group">
                                                <label htmlFor="correo" className="modern-label">
                                                    <i className="bi bi-envelope me-2"></i>Correo Electrónico
                                                </label>
                                                <input
                                                    type="email"
                                                    id="correo"
                                                    name="correo"
                                                    placeholder="usuario@ejemplo.com"
                                                    className="modern-input"
                                                    value={data.correo}
                                                    onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="modern-input-group">
                                                <label htmlFor="nrotelefono" className="modern-label">
                                                    <i className="bi bi-phone me-2"></i>Número de Teléfono
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="nrotelefono"
                                                    name="nrotelefono"
                                                    placeholder="+595 21 123 456"
                                                    className="modern-input"
                                                    value={data.nrotelefono}
                                                    onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                                    maxLength={30}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modern-input-group">
                                        <label htmlFor="direccion" className="modern-label">
                                            <i className="bi bi-geo-alt me-2"></i>Dirección
                                        </label>
                                        <textarea
                                            id="direccion"
                                            name="direccion"
                                            placeholder="Ingresa tu dirección completa..."
                                            className="modern-textarea text-black"
                                            style={{ height: '90px' }}
                                            value={data.direccion}
                                            onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                            maxLength={150}
                                        />
                                        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right', marginTop: '4px' }}>
                                            {data.direccion?.length || 0}/150 caracteres
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="div-report-button">
                                <button type="submit" className="modern-button btn-primary">
                                    <i className="bi bi-check-lg"></i>Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Perfil;
