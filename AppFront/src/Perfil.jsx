import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, updateUser, updateUserImage, deleteUserImage } from "./services/usuario.service";
import { HostLocation } from './utils/HostLocation';
import Header from "./Header";
import Sidebar from "./Sidebar";
import Loading from "./layouts/Loading";
import Close from "./layouts/Close";

export const Perfil = ({ userLog, setUserLog }) => {

    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [dataOriginal] = useState(userLog);
    const [data, setData] = useState(userLog);
    const initialDataRef = useRef(userLog);
    const [nombreUsuarioMsj, setNombreUsuarioMsj] = useState('');
    const [nombreUsuarioError, setNombreUsuarioError] = useState(false);
    const [nombreError, setNombreError] = useState(false);
    const [close, setClose] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [eliminarImagen, setEliminarImagen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Función para comparar si hay cambios reales
    const hasChanges = () => {
        // Comparar datos (solo campos editables)
        const dataComparable = {
            nombreusuario: data?.nombreusuario,
            nombre: data?.nombre,
            apellido: data?.apellido,
            nrodoc: data?.nrodoc,
            fechanacimiento: data?.fechanacimiento,
            correo: data?.correo,
            nrotelefono: data?.nrotelefono,
            direccion: data?.direccion,
            imagennombre: data?.imagennombre,
            imagentipo: data?.imagentipo,
            imagenurl: data?.imagenurl
        };

        const dataOriginalComparable = {
            nombreusuario: dataOriginal?.nombreusuario,
            nombre: dataOriginal?.nombre,
            apellido: dataOriginal?.apellido,
            nrodoc: dataOriginal?.nrodoc,
            fechanacimiento: dataOriginal?.fechanacimiento,
            correo: dataOriginal?.correo,
            nrotelefono: dataOriginal?.nrotelefono,
            direccion: dataOriginal?.direccion,
            imagennombre: dataOriginal?.imagennombre,
            imagentipo: dataOriginal?.imagentipo,
            imagenurl: dataOriginal?.imagenurl
        };

        return JSON.stringify(dataComparable) !== JSON.stringify(dataOriginalComparable);
    };

    const confirmarEscape = () => {
        setClose(false);
        if (!nombreUsuarioError && !nombreError) navigate(-1);
    };

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

    useEffect(() => {
        recuperarUsuarios();
    }, []);

    // Marcar cambios sin guardar cuando se modifica data
    useEffect(() => {
        setHasUnsavedChanges(hasChanges());
    }, [data]);

    const recuperarUsuarios = async () => {
        const response = await getUser();
        setUsuarios(response.items);

        const BACKEND_URL = HostLocation(1);
        if (userLog?.imagenurl) setImagenSeleccionada(BACKEND_URL + "/biotech" + userLog?.imagenurl);
    }

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
        event?.preventDefault();
        const form = event?.currentTarget;
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
            event?.stopPropagation();
            form?.classList.add('was-validated');
            setLoading(false);
            return false;
        }

        if (form?.checkValidity() !== false) {
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

            form?.classList.remove('was-validated');
            setHasUnsavedChanges(false);
            initialDataRef.current = data;
            setLoading(false);
            setClose(true);
            return true;
        } else {
            form?.classList.add('was-validated');
            setLoading(false);
            return false;
        }
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

    const handleSaveFromHeader = async () => {
        return await handleSubmit();
    };

    return (
        <>

            {loading && (
                <Loading />
            )}
            {close && (
                <Close confirmar={confirmarEscape} title={'Perfil'} gen={true} />
            )}

            <Header userLog={userLog} title={'PERFIL'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} Close={false} hasUnsavedChanges={hasUnsavedChanges} onSave={handleSaveFromHeader} modulotxt="perfil" />
            <Sidebar
                userLog={userLog}
                setUserLog={setUserLog}
                isSidebarVisible={true}
            />
            <div className="form-card">
                {/* Header del perfil */}
                <div className="extend-header">
                    <div className="profile-avatar">
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <h2 className="profile-name">
                        {data.nombre || data.apellido ? data.nombre + " " + data.apellido : 'Perfil'}
                    </h2>
                    <p className="profile-role">
                        @{data.nombreusuario || 'USER'}
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
                                    <i className="bi bi-person-badge me-2"></i>Nombre de Usuario
                                    <i className="text-danger ms-1">*</i>
                                </label>
                                <input
                                    type="text"
                                    id="nombreusuario"
                                    name="nombreusuario"
                                    placeholder="Ingresa tu nombre de usuario"
                                    className={`modern-input-edit ${nombreUsuarioError ? 'error' : ''}`}
                                    value={data.nombreusuario}
                                    onChange={(event) => setData({ ...data, [event.target.name]: event.target.value.toUpperCase() })}
                                    maxLength={50}
                                />
                                <div className="textSizeDesc">
                                    {data.nombreusuario?.length || 0}/50
                                </div>
                                {nombreUsuarioError && (
                                    <small className="text-danger d-block mt-1 text-start">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        {nombreUsuarioMsj}
                                    </small>
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
                                            <i className="bi bi-card-text me-2"></i>Nombre
                                            <i className="text-danger ms-1">*</i>
                                        </label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            placeholder="Ingresa tu nombre"
                                            className={`modern-input-edit ${nombreError ? 'error' : ''}`}
                                            value={data.nombre || ''}
                                            onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                            maxLength={150}
                                        />
                                        <div className="textSizeDesc">
                                            {data.nombre?.length || 0}/150
                                        </div>
                                        {nombreError && (
                                            <small className="text-danger d-block mt-1 text-start">
                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                Este campo es obligatorio.
                                            </small>
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
                                            className="modern-input-edit"
                                            value={data.apellido || ''}
                                            onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                            maxLength={150}
                                        />
                                        <div className="textSizeDesc">
                                            {data.apellido?.length || 0}/150
                                        </div>
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
                                            className="modern-input-edit"
                                            value={data.nrodoc}
                                            onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                            maxLength={30}
                                        />
                                        <div className="textSizeDesc">
                                            {data.nrodoc?.length || 0}/30
                                        </div>
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
                                            className="modern-input-edit"
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
                                            className="modern-input-edit"
                                            value={data.correo}
                                            onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                            maxLength={30}
                                        />
                                        <div className="textSizeDesc">
                                            {data.correo?.length || 0}/30
                                        </div>
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
                                            className="modern-input-edit"
                                            value={data.nrotelefono}
                                            onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                            maxLength={30}
                                        />
                                        <div className="textSizeDesc">
                                            {data.nrotelefono?.length || 0}/30
                                        </div>
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
                                    className="modern-input-edit"
                                    style={{ height: '90px' }}
                                    value={data.direccion}
                                    onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                    maxLength={150}
                                />
                                <div className="textSizeDesc">
                                    {data.direccion?.length || 0}/150
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
        </>
    );
}

export default Perfil;
