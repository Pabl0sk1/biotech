import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getConfig, updateConfig } from "./services/config.service";
import { useNavigate } from "react-router-dom";

export const Tema = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

    const [cerrarTema, setCerrarTema] = useState(false);
    const navigate = useNavigate();

    const [config, setConfig] = useState({
        id: 0,
        entidad: "",
        correo: "",
        nrotelefono: "",
        colorpri: "",
        colorsec: "",
        colorter: "",
        imagen: null
    });

    //Cancelar eliminación con tecla de escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (cerrarTema) { // Verifica si la ventana de confirmación está abierta
                    confirmarEscape();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [cerrarTema]);

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
        setCerrarTema(false);
        navigate('/asist/home');
    };

    const recuperarConfig = async () => {
        const response = await getConfig();
        setConfig(response[0]);
    }

    useEffect(() => {
        recuperarConfig();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        // Crear el objeto que se enviará al backend
        const configImage = {
            ...config,
            entidad: config.entidad,
            correo: config.correo,
            nrotelefono: config.nrotelefono,
            colorpri: config.colorpri,
            colorsec: config.colorsec,
            colorter: config.colorter,
            imagen: null,
            base64imagen: null,
            tipo: null,
            nombre: null,
        };

        // Crear un FormData para enviar los datos
        const formData = new FormData();
        formData.append('configuracion', JSON.stringify(configImage));

        // Convertir base64 a File si existe
        const base64 = `data:${config.tipo};base64,${config.imagen}`;
        if (base64 && base64.startsWith('data:image')) {
            const arr = base64.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            // Usa el nombre original de la imagen si está disponible
            const fileName = `${config.nombre}`;
            const file = new File([u8arr], fileName, { type: mime });
            formData.append('imagen', file);
        }

        // Verificar que la imagen sea un archivo válido
        if (config.imagen && config.imagen instanceof File) {
            formData.append('imagen', config.imagen);
        }

        if (form.checkValidity()) {
            document.documentElement.style.setProperty('--color-primario', config.colorpri);
            document.documentElement.style.setProperty('--color-secundario', config.colorsec);
            document.documentElement.style.setProperty('--color-ternario', config.colorter);
            await updateConfig(config.id, formData);
            setCerrarTema(true);
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    };

    return (
        <>

            {cerrarTema && (
                <>
                    <div className="position-fixed top-0 start-0 z-4 w-100 h-100 bg-dark opacity-25"></div>
                    <div className="position-fixed top-50 start-50 z-7 d-flex align-items-center justify-content-center translate-middle user-select-none">
                        <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                            <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                                <div className="fw-bolder d-flex flex-column align-items-center">
                                    <i className="bi bi-check-circle-fill" style={{ fontSize: '7rem' }}></i>
                                    <p className='fs-5'>Tema editado correctamente</p>
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
                            <p className='container m-0 p-0'>TEMA</p>
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
                                <i className="bi bi-palette-fill me-2 text-black"></i>Tema
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-pencil-square me-2 fs-5"></i>Edición de Tema
                        </p>
                        <form
                            action="url.ph"
                            onSubmit={handleSubmit}
                            className="needs-validation"
                            noValidate
                        >
                            <div className="p-3 pt-5 pb-5 fw-semibold text-start">
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

export default Tema;
