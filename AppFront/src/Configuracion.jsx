import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getConfig, updateConfig, deleteImage } from "./services/config.service";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { HostLocation } from './utils/HostLocation';

export const Configuracion = ({ userLog }) => {

    const [entidadError, setEntidadError] = useState(false);
    const [cerrarConfig, setCerrarConfig] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [eliminarImagen, setEliminarImagen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [config, setConfig] = useState({
        id: 0,
        entidad: "",
        correo: "",
        nrotelefono: "",
        nrodoc: "",
        colorpri: "",
        colorsec: "",
        colorter: "",
        imagennombre: "",
        imagentipo: "",
        imagenurl: ""
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
        navigate(-1);
    };

    const recuperarConfig = async () => {
        const response = await getConfig();
        setConfig(response.items[0]);

        const BACKEND_URL = HostLocation(1);
        if (response.items[0].imagenurl) setImagenSeleccionada(BACKEND_URL + "/biotech" + response.items[0].imagenurl);
    }

    useEffect(() => {
        recuperarConfig();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const form = event.currentTarget;

        let sw = 0;
        if (!config.entidad) {
            setEntidadError(true);
            sw = 1;
        } else {
            setEntidadError(false);
        }

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("configuracion", JSON.stringify(config));

        if (imagenFile) {
            formData.append("imagen", imagenFile);

            if (config.imagenurl) {
                formData.append("imagenAnterior", config.imagenurl);
            }
        }

        if (eliminarImagen && !imagenFile) {
            await deleteImage(config.id);
            setEliminarImagen(false);
        }

        if (form.checkValidity()) {
            await updateConfig(config.id, formData);
            document.documentElement.style.setProperty('--color-primario', config.colorpri);
            document.documentElement.style.setProperty('--color-secundario', config.colorsec);
            document.documentElement.style.setProperty('--color-ternario', config.colorter);
            setCerrarConfig(true);
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
        setIsLoading(false);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setImagenFile(file);
        setEliminarImagen(false);
        setConfig(prev => ({
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
                <Header userLog={userLog} title={'EMPRESA'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        {/* Header del perfil */}
                        <div className="extend-header">
                            <div className="security-icon">
                                <i className="bi bi-building-fill"></i>
                            </div>
                            <h2 className="m-0" style={{ fontSize: '24px', fontWeight: '700' }}>
                                Empresa
                            </h2>
                            <p className="m-0 mt-2 opacity-90" style={{ fontSize: '16px' }}>
                                Ajusta tu empresa a tu manera
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
                                                        setConfig({ ...config, imagennombre: "", imagentipo: "", imagenurl: "" });
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
                                                value={config.entidad || ''}
                                                onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                                maxLength={150}
                                            />
                                            {entidadError && (
                                                <div className="error-message">
                                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                                    La entidad es obligatoria (máx. 150 caracteres)
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="modern-input-group">
                                            <label htmlFor="nrodoc" className="modern-label">
                                                <i className="bi bi-envelope me-2"></i>Número de Documento
                                            </label>
                                            <input
                                                type="email"
                                                id="nrodoc"
                                                name="nrodoc"
                                                placeholder="Ej: 12345678"
                                                className="modern-input"
                                                value={config.nrodoc || ''}
                                                onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                                maxLength={30}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="modern-input-group">
                                            <label htmlFor="nrotelefono" className="modern-label">
                                                <i className="bi bi-telephone me-2"></i>Número de Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                id="nrotelefono"
                                                name="nrotelefono"
                                                placeholder="+595 21 123 456"
                                                className="modern-input"
                                                value={config.nrotelefono || ''}
                                                onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                                maxLength={30}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="modern-input-group">
                                            <label htmlFor="correo" className="modern-label">
                                                <i className="bi bi-envelope me-2"></i>Correo Electrónico
                                            </label>
                                            <input
                                                type="email"
                                                id="correo"
                                                name="correo"
                                                placeholder="correo@empresa.com"
                                                className="modern-input"
                                                value={config.correo || ''}
                                                onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                                maxLength={30}
                                            />
                                        </div>
                                    </div>
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