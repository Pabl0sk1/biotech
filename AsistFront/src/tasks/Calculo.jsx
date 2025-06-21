import { Link } from 'react-router-dom';
import { generarInformePDF } from '../utils/InformeVentas';
import { useState, useEffect } from 'react';
import { getVenta } from '../services/venta.service';
import { getCliente } from '../services/cliente.service';
import { getUsuario } from '../services/usuario.service';
import { getTipoPago } from '../services/tipopago.service';

export const Calculo = ({ usuarioUsed }) => {
    const UrlBase = '/fashion';

    const initial = {
        usuario: {
            id: 0,
            nombreusuario: ""
        },
        cliente: {
            id: 0,
            nombre: ""
        },
        tipopago: {
            id: 0,
            tipopago: ""
        },
        estado: "",
        fechadesde: "",
        fechahasta: "",
        nrofacturadesde: "",
        nrofacturahasta: "",
        opcion: ""
    };

    const [data, setData] = useState(initial);
    const [ventas, setVentas] = useState([]);
    const [clienteMsj, setClienteMsj] = useState('');
    const [clienteError, setClienteError] = useState(false);
    const [indCliente, setIndCliente] = useState(-1);
    const [sugCliente, setSugCliente] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [usuarioMsj, setUsuarioMsj] = useState('');
    const [usuarioError, setUsuarioError] = useState(false);
    const [indUsuario, setIndUsuario] = useState(-1);
    const [sugUsuario, setSugUsuario] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [tipopagos, setTipopagos] = useState([]);

    const recuperarClientes = async () => {
        const response = await getCliente();
        setClientes(response);
    }

    const recuperarUsuarios = async () => {
        const response = await getUsuario();
        setUsuarios(response);
    }

    const recuperarTipoPagos = async () => {
        const response = await getTipoPago();
        setTipopagos(response);
    }

    const recuperarVentas = async () => {
        const response = await getVenta();
        setVentas(response);
    }

    useEffect(() => {
        recuperarClientes();
        recuperarUsuarios();
        recuperarTipoPagos();
        recuperarVentas();
    }, []);

    const manejarTeclaCliente = (event) => {
        if (event.key === 'ArrowDown') {
            setIndCliente((prev) => (prev < sugCliente.length - 1 ? prev + 1 : prev));
        } else if (event.key === 'ArrowUp') {
            setIndCliente((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (indCliente >= 0) {
                seleccionarCliente(indCliente);
            }
        }
    };

    const seleccionarCliente = (index) => {
        const clienteSeleccionado = sugCliente[index];
        setData({
            ...data,
            cliente: {
                id: clienteSeleccionado.id,
                nombre: clienteSeleccionado.nombre
            }
        });
        handleClienteChange({
            target: {
                name: 'cliente',
                value: clienteSeleccionado.nombre
            }
        });
        setSugCliente([]);
        setIndCliente(-1);
    };

    const manejarTeclaUsuario = (event) => {
        if (event.key === 'ArrowDown') {
            setIndUsuario((prev) => (prev < sugUsuario.length - 1 ? prev + 1 : prev));
        } else if (event.key === 'ArrowUp') {
            setIndUsuario((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (indUsuario >= 0) {
                seleccionarUsuario(indUsuario);
            }
        }
    };

    const seleccionarUsuario = (index) => {
        const usuarioSeleccionado = sugUsuario[index];
        setData({
            ...data,
            usuario: {
                id: usuarioSeleccionado.id,
                nombreusuario: usuarioSeleccionado.nombreusuario
            }
        });
        handleUsuarioChange({
            target: {
                name: 'usuario',
                value: usuarioSeleccionado.nombreusuario
            }
        });
        setSugUsuario([]);
        setIndUsuario(-1);
    };

    const verificarCliente = (clienteNombre) => {
        return clientes.some(p => p.nombre === clienteNombre || p.nrodoc === clienteNombre || clienteNombre === "");
    }

    const verificarUsuario = (usuarioNombre) => {
        return usuarios.some(u => u.nombreusuario === usuarioNombre || usuarioNombre === "");
    }

    const handleClienteChange = (e) => {
        const nuevoCliente = e.target.value;
        const clienteEncontrado = clientes.find(p => p.nombre === nuevoCliente || p.nrodoc === nuevoCliente);

        setData({
            ...data,
            cliente: clienteEncontrado
                ? { id: clienteEncontrado.id, nombre: clienteEncontrado.nombre }
                : { id: 0, nombre: nuevoCliente } // Limpia el id si el cliente no es válido
        });

        const existe = verificarCliente(nuevoCliente);

        if (!existe && nuevoCliente != "") {
            setClienteMsj('El cliente no es válido.');
            setClienteError(true);
        } else {
            setClienteMsj('');
            setClienteError(false);
        }

        // Actualiza las sugerencias
        const nuevasSugerencias = clientes
            .filter(p => p.nombre.toLowerCase().includes(nuevoCliente.toLowerCase()) || p.nrodoc.startsWith(nuevoCliente))
            .slice(0, 5);
        setSugCliente(nuevoCliente.trim() === '' ? [] : nuevasSugerencias);
    };

    const handleUsuarioChange = (e) => {
        const nuevoUsuario = e.target.value;
        const usuarioEncontrado = usuarios.find(u => u.nombreusuario === nuevoUsuario);

        setData({
            ...data,
            usuario: usuarioEncontrado
                ? { id: usuarioEncontrado.id, nombreusuario: usuarioEncontrado.nombreusuario }
                : { id: 0, nombreusuario: nuevoUsuario } // Limpia el id si el cliente no es válido
        });

        const existe = verificarUsuario(nuevoUsuario);

        if (!existe && nuevoUsuario != "") {
            setUsuarioMsj('El usuario no es válido.');
            setUsuarioError(true);
        } else {
            setUsuarioMsj('');
            setUsuarioError(false);
        }

        // Actualiza las sugerencias
        const nuevasSugerencias = usuarios
            .filter(u => u.nombreusuario.toLowerCase().includes(nuevoUsuario.toLowerCase()))
            .slice(0, 5);
        setSugUsuario(nuevoUsuario.trim() === '' ? [] : nuevasSugerencias);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        let sw = 0;

        // Verificar si el cliente seleccionado es válido
        if (!verificarCliente(data.cliente.nombre) && data.cliente.nombre != "") {
            setClienteMsj('El cliente no es válido.');
            setClienteError(true);
            sw = 1;
        } else {
            setClienteMsj('');
            setClienteError(false);
        }
        // Verificar si el usuario seleccionado es válido
        if (!verificarUsuario(data.usuario.nombreusuario) && data.usuario.nombreusuario != "") {
            setUsuarioMsj('El usuario no es válido.');
            setUsuarioError(true);
            sw = 1;
        } else {
            setUsuarioMsj('');
            setUsuarioError(false);
        }

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const listaVentas = ventas.filter(v =>
            (v.fecha >= data.fechadesde || data.fechadesde === "") &&
            (v.fecha <= data.fechahasta || data.fechahasta === "") &&
            (v.cliente.id === data.cliente.id || data.cliente.id === 0) &&
            (v.usuario.id === data.usuario.id || data.usuario.id === 0) &&
            (v.tipopago.id === data.tipopago.id || data.tipopago.id === 0) &&
            (v.estado === data.estado || data.estado === "") &&
            (v.nrofactura >= data.nrofacturadesde || data.nrofacturadesde === "") &&
            (v.nrofactura <= data.nrofacturahasta || data.nrofacturahasta === "")
        ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));;

        if (form.checkValidity()) {
            generarInformePDF(listaVentas, data);
            form.classList.remove('was-validated');
        } else {
            form.classList.add('was-validated');
        }
    }

    return (
        <>
            <div className="row-cols-auto w-100 m-0">
                <nav className="navbar navbar-expand-lg navbar-light bg-white top-0 position-fixed p-0 z-1 w-100 user-select-none border-3 border-black border-bottom">
                    <div className="d-flex w-100">
                        <div className="col-2 d-flex align-items-center m-0 p-1 ps-3 border-end border-dark border-3">
                            <Link className='p-0 text-black ps-1 pe-1 border-0 menuList d-flex' to={UrlBase + "/home"}>
                                <i className='bi bi-chevron-double-left fs-3' style={{ textShadow: '1px 0 0 black, 0 1px 0 black, -1px 0 0 black, 0 -1px 0 black' }}></i>
                            </Link>
                            <p className='container m-0 p-0'>INFORME DE VENTAS</p>
                        </div>
                        <div className='d-flex align-items-center ps-3'>
                            <i className='bi bi-person fs-3 me-3'></i>
                            <p className='m-0'>{usuarioUsed.tipousuario.tipousuario}</p>
                        </div>
                        <div className='d-flex align-items-center ms-auto'>
                            <img className="navbar-brand p-0 m-0 me-3" src="/logo.png" alt="Maria Mora Atelier" style={{ width: '80px', height: '40px' }} />
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
                                <i className="bi bi-file-earmark-text-fill me-2 text-black"></i>Informe
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Ventas
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-clipboard-data me-2 fs-5"></i>Realizar Informe de Ventas
                        </p>
                        <form
                            action="url.ph"
                            onSubmit={handleSubmit}
                            className="needs-validation"
                            noValidate
                        >
                            <div className="p-3 pt-5 pb-5 fw-semibold text-start">
                                <div className="input-group">
                                    <label className="form-label m-0">Fecha desde-hasta</label>
                                    <input
                                        type="date"
                                        id="fechadesde"
                                        name="fechadesde"
                                        className="ms-2 form-control border-input"
                                        value={data.fechadesde}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                    />
                                    <input
                                        type="date"
                                        id="fechahasta"
                                        name="fechahasta"
                                        className="ms-2 form-control border-input"
                                        value={data.fechahasta}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="form-label m-0">Factura desde-hasta</label>
                                    <input
                                        type="text"
                                        id="nrofacturadesde"
                                        name="nrofacturadesde"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={data.nrofacturadesde}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                    />
                                    <input
                                        type="text"
                                        id="nrofacturahasta"
                                        name="nrofacturahasta"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={data.nrofacturahasta}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                    />
                                </div>
                                <div className="input-group position-relative">
                                    <label htmlFor="cliente" className="form-label m-0">Cliente</label>
                                    <input
                                        type="text"
                                        id="cliente"
                                        name="cliente"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={data.cliente.nombre || ""}
                                        onChange={handleClienteChange}
                                        onKeyDown={manejarTeclaCliente}
                                        onBlur={() => setTimeout(() => setSugCliente([]), 200)}
                                        onFocus={() => {
                                            if (clientes.length > 0 && data.cliente?.nombre) {
                                                const nuevasSugerencias = clientes
                                                    .filter(p => p.nombre.toLowerCase().includes(data.cliente.nombre.toLowerCase()) || p.nrodoc.startsWith(data.cliente.nrodoc))
                                                    .slice(0, 5);
                                                setSugCliente(nuevasSugerencias);
                                            }
                                        }}
                                    />
                                    {sugCliente.length > 0 && (
                                        <ul
                                            className="list-group position-absolute"
                                            style={{ zIndex: 1000, top: '100%', left: 160 }}
                                            onMouseDown={(e) => e.preventDefault()} // Evitar que el blur cierre la lista durante el clic
                                        >
                                            {sugCliente.map((sugerencia, index) => (
                                                <li
                                                    key={sugerencia.id}
                                                    className={`list-group-item list-group-item-action ${indCliente === index ? 'active' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => seleccionarCliente(index)}
                                                    onMouseEnter={() => setIndCliente(index)}
                                                >
                                                    {sugerencia.nombre}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className={`invalid-feedback text-danger text-start ${clienteError ? 'contents' : 'd-none'}`}>
                                        <i className="bi bi-exclamation-triangle-fill m-2"></i>{clienteMsj}
                                    </div>
                                </div>
                                <div className="input-group position-relative">
                                    <label htmlFor="usuario" className="form-label m-0">Usuario</label>
                                    <input
                                        type="text"
                                        id="usuario"
                                        name="usuario"
                                        placeholder="Escribe..."
                                        className="ms-2 form-control border-input"
                                        value={data.usuario.nombreusuario || ""}
                                        onChange={handleUsuarioChange}
                                        onKeyDown={manejarTeclaUsuario}
                                        onBlur={() => setTimeout(() => setSugUsuario([]), 200)} // Retrasar el onBlur para permitir el click
                                        onFocus={() => {
                                            if (usuarios.length > 0 && data.usuario?.nombreusuario) {
                                                const nuevasSugerencias = usuarios
                                                    .filter(u => u.nombreusuario.toLowerCase().includes(data.usuario.nombreusuario.toLowerCase()))
                                                    .slice(0, 5);
                                                setSugUsuario(nuevasSugerencias);
                                            }
                                        }}
                                    />
                                    {sugUsuario.length > 0 && (
                                        <ul
                                            className="list-group position-absolute"
                                            style={{ zIndex: 1000, top: '100%', left: 160 }}
                                            onMouseDown={(e) => e.preventDefault()} // Evitar que el blur cierre la lista durante el clic
                                        >
                                            {sugUsuario.map((sugerencia, index) => (
                                                <li
                                                    key={sugerencia.id}
                                                    className={`list-group-item list-group-item-action ${indUsuario === index ? 'active' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => seleccionarUsuario(index)}
                                                    onMouseEnter={() => setIndUsuario(index)}
                                                >
                                                    {sugerencia.nombreusuario}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className={`invalid-feedback text-danger text-start ${usuarioError ? 'contents' : 'd-none'}`}>
                                        <i className="bi bi-exclamation-triangle-fill m-2"></i>{usuarioMsj}
                                    </div>
                                </div>
                                <div className="input-group w-25">
                                    <label htmlFor="tipopago" className="form-label m-0">Tipo de Pago</label>
                                    <select
                                        id="tipopago"
                                        name="tipopago"
                                        className="ms-2 form-select border-input"
                                        value={data.tipopago ? data.tipopago.id : ''}
                                        onChange={(event) => {
                                            const selectedTipoPago = tipopagos.find(r => r.id === parseInt(event.target.value));
                                            setData({ ...data, tipopago: selectedTipoPago ? selectedTipoPago : { id: 0, tipopago: "" } });
                                        }}
                                    >
                                        <option value={0} className="bg-secondary-subtle">Seleccione...</option>
                                        {tipopagos.map((tp) => (
                                            <option key={tp.id} value={tp.id}>{tp.tipopago}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group w-25">
                                    <label htmlFor="estado" className="form-label m-0">Estado</label>
                                    <select
                                        id="estado"
                                        name="estado"
                                        className="ms-2 form-select border-input"
                                        value={data.estado ? data.estado : ''}
                                        onChange={(event) => setData({ ...data, [event.target.name]: event.target.value })}
                                    >
                                        <option value="" className="bg-secondary-subtle">Seleccione...</option>
                                        <option key={1} value={'C'}>Confirmada</option>
                                        <option key={2} value={'P'}>Pendiente</option>
                                        <option key={3} value={'X'}>Cancelada</option>
                                    </select>
                                </div>
                            </div>
                            <div className="border-top border-2 border-black pt-2 pb-2 ps-3 m-0 text-start user-select-none">
                                <button onClick={() => {
                                    setData({
                                        ...data,
                                        opcion: "G"
                                    });
                                }} type='submit' className="btn btn-warning me-4 fw-bold ps-3 pe-3">
                                    <i className="bi bi-printer-fill me-2"></i>Generar
                                </button>
                                <button onClick={() => {
                                    setData({
                                        ...data,
                                        opcion: "D"
                                    });
                                }} type='submit' className="btn btn-success text-black fw-bold">
                                    <i className="bi bi-download me-2"></i>Descargar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Calculo;