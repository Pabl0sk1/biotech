import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getConfigPaginado, updateConfig } from "./services/config.service";
import { useNavigate } from "react-router-dom";

export const Configuracion = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

    const [entidadError, setEntidadError] = useState(false);
    const [correoError, setCorreoError] = useState(false);
    const [cerrarConfig, setCerrarConfig] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
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
                if (cerrarConfig) { // Verifica si la ventana de confirmación está abierta
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

            // Usa el nombre original de la imagen si está disponible
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
                <>
                    <div className="position-fixed top-0 start-0 z-4 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-7 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-check-circle-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>Configuración editada correctamente</p>
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
                            <p className='container m-0 p-0'>CONFIGURACIÓN</p>
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
                                <i className="bi bi-gear-fill me-2 text-black"></i>Configuración
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-pencil-square me-2 fs-5"></i>Editar Configuración
                        </p>
                        <form
                            action="url.ph"
                            onSubmit={handleSubmit}
                            className="needs-validation"
                            noValidate
                        >
                            <div className="p-3 pt-5 pb-5 fw-semibold text-start">
                                <div className="input-group">
                                    <label htmlFor="logo" className="form-label me-2">Logotipo</label>
                                    <div
                                        className="colorTernarioImage bg-secondary-subtle text-center d-flex justify-content-center align-items-center position-relative"
                                        style={{ cursor: 'pointer', height: '170px', width: '25%' }}
                                        onClick={() => document.getElementById('fileInput').click()}
                                    >
                                        {imagenSeleccionada ? (
                                            <div className='w-100 h-100 position-relative'>
                                                <img src={`data:image/*;base64, ${imagenSeleccionada}`} alt="Vista previa" className='w-100 h-100' />

                                                {/* Botón para eliminar la imagen */}
                                                <button
                                                    className="btn btn-danger position-absolute top-0 end-0 m-1 p-1 rounded-circle z-0"
                                                    style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Evita que se active el click en la imagen
                                                        setImagenSeleccionada(null);
                                                    }}
                                                >
                                                    <i className="bi bi-x-lg text-white"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="m-0"><i className='bi bi-card-image' style={{ fontSize: '5rem' }}></i></p>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        name="imagen"
                                        accept="image/*"
                                        className='d-none'
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="entidad" className="form-label m-0">Entidad</label>
                                    <input
                                        type="text"
                                        id="entidad"
                                        name="entidad"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={config.entidad}
                                        onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                        maxLength={30}
                                    />
                                    <div className={`invalid-feedback text-danger text-start ${entidadError ? 'contents' : 'd-none'}`}>
                                        <i className="bi bi-exclamation-triangle-fill m-2"></i>La entidad es obligatoria y no debe sobrepasar los 30 caracteres.
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="correo" className="form-label m-0">Correo</label>
                                    <input
                                        type="text"
                                        id="correo"
                                        name="correo"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={config.correo}
                                        onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                        maxLength={30}
                                    />
                                    <div className={`invalid-feedback text-danger text-start ${correoError ? 'contents' : 'd-none'}`}>
                                        <i className="bi bi-exclamation-triangle-fill m-2"></i>El correo es obligatorio y no debe sobrepasar los 30 caracteres.
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="nrotelefono" className="form-label m-0">Teléfono</label>
                                    <input type="text"
                                        id="nrotelefono"
                                        name="nrotelefono"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={config.nrotelefono}
                                        onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                        maxLength={20}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="colorpri" className="form-label m-0">Color Primario</label>
                                    <input
                                        type="color"
                                        id="colorpri"
                                        name="colorpri"
                                        className="ms-2 form-control form-control-color rounded-0 colorTernario"
                                        value={config.colorpri}
                                        onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="colorsec" className="form-label m-0">Color Secundario</label>
                                    <input
                                        type="color"
                                        id="colorsec"
                                        name="colorsec"
                                        className="ms-2 form-control form-control-color rounded-0 colorTernario"
                                        value={config.colorsec}
                                        onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                    />
                                </div>
                                <div className="input-group mb-0">
                                    <label htmlFor="colorter" className="form-label m-0">Color Ternario</label>
                                    <input
                                        type="color"
                                        id="colorter"
                                        name="colorter"
                                        className="ms-2 form-control form-control-color rounded-0 colorTernario"
                                        value={config.colorter}
                                        onChange={(event) => setConfig({ ...config, [event.target.name]: event.target.value })}
                                    />
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
    )
}

export default Configuracion
