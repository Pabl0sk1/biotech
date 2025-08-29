import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getConfigPaginado, updateConfig } from "./services/config.service";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

export const Configuracion = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

    const [entidadError, setEntidadError] = useState(false);
    const [correoError, setCorreoError] = useState(false);
    const [cerrarConfig, setCerrarConfig] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [config, setConfig] = useState({
        id: 0,
        entidad: "",
        correo: "",
        nrotelefono: "",
        colorpri: "",
        colorsec: "",
        colorter: "",
        tipo: "",
        nombre: "",
        base64imagen: "",
        imagen: null
    });

    //Cancelar eliminación con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (cerrarConfig) {
                    confirmarEscape();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [cerrarConfig]);

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
        setCerrarConfig(false);
        navigate('/asist/home');
    };

    const recuperarConfig = async () => {
        const response = await getConfigPaginado(0);
        setConfig(response.list[0]);
        setImagenSeleccionada(response.list[0].base64imagen);
    }

    useEffect(() => {
        recuperarConfig();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const form = event.currentTarget;

        // Crear el objeto que se enviará al backend
        const configData = {
            ...config,
            entidad: config.entidad,
            correo: config.correo,
            nrotelefono: config.nrotelefono,
            colorpri: config.colorpri,
            colorsec: config.colorsec,
            colorter: config.colorter,
            tipo: "",
            nombre: "",
            base64imagen: "",
            imagen: null
        };

        // Crear un FormData para enviar los datos
        const formData = new FormData();
        formData.append('configuracion', JSON.stringify(configData));

        // Convertir base64 a File si existe
        const img = `data:image/${config.tipo};base64,${config.base64imagen}`;
        if (imagenSeleccionada) {
            const arr = img.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            const originalName = config.nombre || 'imagen';
            const fileName = `${originalName}`;
            const file = new File([u8arr], fileName, { type: mime },);
            formData.append('imagen', file);
        }

        let sw = 0;

        if (!config.entidad) {
            setEntidadError(true);
            sw = 1;
        } else {
            setEntidadError(false);
        }

        if (!config.correo) {
            setCorreoError(true);
            sw = 1;
        } else {
            setCorreoError(false);
        }

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            setIsLoading(false);
            return;
        }

        if (form.checkValidity()) {
            document.documentElement.style.setProperty('--color-primario', config.colorpri);
            document.documentElement.style.setProperty('--color-secundario', config.colorsec);
            document.documentElement.style.setProperty('--color-ternario', config.colorter);
            await updateConfig(config.id, formData);
            setCerrarConfig(true);
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
        setIsLoading(false);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            setImagenSeleccionada(base64String);
            setConfig({
                ...config,
                tipo: file.name.split('.').slice(1).join('.'),
                base64imagen: base64String,
                nombre: file.name.split('.').slice(0, -1).join('.'),
                imagen: reader.result
            });
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    return (
        <>

            {cerrarConfig && (
                <div className="success-modal">
                    <div className="success-content">
                        <div className="success-icon">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>¡Configuración Guardada!</h3>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                            Los cambios se han aplicado correctamente
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
                <Header usuarioUsed={usuarioUsed} title={'CONFIGURACIÓN'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />

                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        {/* Header del perfil */}
                        <div className="extend-header">
                            <div className="security-icon">
                                <i className="bi bi-gear-fill"></i>
                            </div>
                            <h2 className="m-0" style={{ fontSize: '24px', fontWeight: '700' }}>
                                Configuración
                            </h2>
                            <p className="m-0 mt-2 opacity-90" style={{ fontSize: '16px' }}>
                                Ajusta tu cuenta a tu manera
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                            <div className="form-body">
                                {/* Logo Section */}
                                <div className="modern-input-group">
                                    <label className="modern-label">
                                        <i className="bi bi-image me-2"></i>Logotipo
                                    </label>
                                    <div
                                        className={`image-upload ${imagenSeleccionada ? 'has-image' : ''}`}
                                        onClick={() => document.getElementById('fileInput').click()}
                                    >
                                        {imagenSeleccionada ? (
                                            <>
                                                <img
                                                    src={`data:image/*;base64, ${imagenSeleccionada}`}
                                                    alt="Vista previa"
                                                    className="image-preview"
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-image"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImagenSeleccionada(null);
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

                                {/* Form Fields */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="modern-input-group">
                                            <label htmlFor="entidad" className="modern-label">
                                                <i className="bi bi-building me-2"></i>Entidad *
                                            </label>
                                            <input
                                                type="text"
                                                id="entidad"
                                                name="entidad"
                                                placeholder="Nombre de la entidad"
                                                className={`modern-input ${entidadError ? 'error' : ''}`}
                                                value={config.entidad}
                                                onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                                maxLength={30}
                                            />
                                            {entidadError && (
                                                <div className="error-message">
                                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                                    La entidad es obligatoria (máx. 30 caracteres)
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="modern-input-group">
                                            <label htmlFor="correo" className="modern-label">
                                                <i className="bi bi-envelope me-2"></i>Correo Electrónico *
                                            </label>
                                            <input
                                                type="email"
                                                id="correo"
                                                name="correo"
                                                placeholder="correo@empresa.com"
                                                className={`modern-input ${correoError ? 'error' : ''}`}
                                                value={config.correo}
                                                onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                                maxLength={30}
                                            />
                                            {correoError && (
                                                <div className="error-message">
                                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                                    El correo es obligatorio (máx. 30 caracteres)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="modern-input-group">
                                    <label htmlFor="nrotelefono" className="modern-label">
                                        <i className="bi bi-telephone me-2"></i>Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        id="nrotelefono"
                                        name="nrotelefono"
                                        placeholder="+595 21 123 456"
                                        className="modern-input"
                                        value={config.nrotelefono}
                                        onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                        maxLength={20}
                                    />
                                </div>

                                {/* Color Section */}
                                <h4 className="mt-4 mb-3" style={{ color: '#374151', fontWeight: '600' }}>
                                    <i className="bi bi-palette me-2"></i>Colores del Sistema
                                </h4>

                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="modern-input-group">
                                            <label htmlFor="colorpri" className="modern-label">Color Primario</label>
                                            <div className="color-input-group">
                                                <div
                                                    className="color-preview"
                                                    style={{ backgroundColor: config.colorpri }}
                                                    onClick={() => document.getElementById('colorpri').click()}
                                                ></div>
                                                <input
                                                    type="color"
                                                    id="colorpri"
                                                    name="colorpri"
                                                    className="d-none"
                                                    value={config.colorpri}
                                                    onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    className="modern-input"
                                                    value={config.colorpri}
                                                    onChange={(event) => setConfig({ ...config, colorpri: event.target.value })}
                                                    placeholder="#ffffff"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="modern-input-group">
                                            <label htmlFor="colorsec" className="modern-label">Color Secundario</label>
                                            <div className="color-input-group">
                                                <div
                                                    className="color-preview"
                                                    style={{ backgroundColor: config.colorsec }}
                                                    onClick={() => document.getElementById('colorsec').click()}
                                                ></div>
                                                <input
                                                    type="color"
                                                    id="colorsec"
                                                    name="colorsec"
                                                    className="d-none"
                                                    value={config.colorsec}
                                                    onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    className="modern-input"
                                                    value={config.colorsec}
                                                    onChange={(event) => setConfig({ ...config, colorsec: event.target.value })}
                                                    placeholder="#ffffff"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="modern-input-group">
                                            <label htmlFor="colorter" className="modern-label">Color Terciario</label>
                                            <div className="color-input-group">
                                                <div
                                                    className="color-preview"
                                                    style={{ backgroundColor: config.colorter }}
                                                    onClick={() => document.getElementById('colorter').click()}
                                                ></div>
                                                <input
                                                    type="color"
                                                    id="colorter"
                                                    name="colorter"
                                                    className="d-none"
                                                    value={config.colorter}
                                                    onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    className="modern-input"
                                                    value={config.colorter}
                                                    onChange={(event) => setConfig({ ...config, colorter: event.target.value })}
                                                    placeholder="#ffffff"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div style={{
                                background: '#f9fafb',
                                padding: '24px 32px',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            }}>
                                <Link
                                    className="modern-button btn-secondary"
                                    to={UrlBase + '/home'}
                                >
                                    <i className="bi bi-x-lg"></i>
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    className="modern-button btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <i className="bi bi-check-lg"></i>
                                    )}
                                    {isLoading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Configuracion