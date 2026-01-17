import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveReport, updateReport } from '../services/informe.service.js';
import { getEntity } from '../services/entidad.service';
import { getProduct } from '../services/producto.service';
import { getHarvest } from '../services/zafra.service';
import { AddAccess } from '../utils/AddAccess.js';
import Header from '../Header';
import AutocompleteSelect from '../AutocompleteSelect.jsx';
import Loading from "../layouts/Loading";
import Close from "../layouts/Close";

export const Data = () => {

    const initial = {
        zafras: [],
        vendedores: []
    }

    const navigate = useNavigate();
    const { state } = useLocation();
    const userLog = state?.userLog;
    const modoEdicion = state?.modoEdicion;
    const [datos, setDatos] = useState(state?.datos);
    const [data, setData] = useState(initial);
    const [clientes, setClientes] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);
    const [productos, setProductos] = useState([]);
    const [zafras, setZafras] = useState([]);
    const [selectedZafras, setSelectedZafras] = useState([]);
    const [open, setOpen] = useState({});
    const [close, setClose] = useState(false);
    const [loading, setLoading] = useState(false);
    const [descError, setDescError] = useState(false);

    const uid = () => crypto.randomUUID();

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
        if (!descError) navigate(-1);
    };

    useEffect(() => {
        const load = async () => {
            const cli = await getEntity('', '', '', 'categorias:contains:Cliente;activo:eq:true');
            const ven = await getEntity('', '', '', 'categorias:contains:Vendedor;activo:eq:true');
            const pro = await getProduct('', '', '', 'activo:eq:true;incluirplan:eq:true');
            const zaf = await getHarvest();

            setClientes(cli.items.filter(v => v.cartera));
            setVendedores(ven.items);
            setProductos(pro.items);
            setZafras(zaf.items);
        };
        load();

        if (datos?.data) {
            try {
                const dataParsed = typeof datos.data === 'string'
                    ? JSON.parse(datos.data)
                    : datos.data;
                setData(dataParsed);
            } catch (error) {
                console.error('Error al parsear datos del informe:', error);
                setData([]);
            }
        }
    }, [datos]);

    const formatearFechaParaInput = (fecha) => {
        if (!fecha) return '';

        // Si ya está en formato correcto (YYYY-MM-DD), retornarla
        if (typeof fecha === 'string') {
            return fecha;
        }

        // Convertir a objeto Date
        const date = new Date(fecha);

        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) return '';

        // Formatear a YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const toggle = (id) => setOpen(o => ({ ...o, [id]: !o[id] }));

    const clientesPorVendedor = (idVendedor) => {
        return clientes.filter(c => c.cartera?.entidadid == idVendedor);
    }

    const agregarVendedor = (vendedor) => {
        if (!selectedZafras.length) return;

        // Obtener clientes del vendedor
        const clientesList = clientesPorVendedor(vendedor.erpid);

        // Mapear clientes para agregar campos necesarios y productos
        const clientesConProductos = clientesList.map(c => ({
            uid: uid(),
            nomape: c.nomape,
            nombre: c.nombre,
            apellido: c.apellido,
            nrodoc: c.nrodoc,
            areacultivo: 0,
            productos: productos.map(p => ({
                uid: uid(),
                grupoproducto: p.nombrecomercial?.subgrupoproducto?.grupoproducto?.grupoproducto,
                nombre: p.nombrecomercial?.nombrecomercial,
                principioactivo: p.principioactivo?.principioactivo,
                dosis: p.dosis || 0,
                volpotencial: 0,
                volplaneado: 0,
                porcenparti: 0,
                precio: p.precio || 0,
                areaplaneada: 0,
                planeados: 0
            }))
        }));

        // Mapear zafras para agregar clientes
        const zafrasConClientes = zafras
            .filter(z => selectedZafras.includes(z.id))
            .map(z => ({
                uid: uid(),
                zafra: z.descripcion,
                clientes: clientesConProductos
            }));

        // Armar el vendedor con sus zafras adentro
        const vendedorConZafras = {
            ...vendedor,
            uid: uid(),
            zafras: zafrasConClientes
        };

        setData(prev => {
            // Verificar si el vendedor ya existe
            if (prev.vendedores.some(v => v.erpid === vendedor.erpid)) {
                return prev;
            }

            // Agregar el vendedor a la lista
            return {
                ...prev,
                vendedores: [...prev.vendedores, vendedorConZafras]
            };
        });

        // Limpiar selección
        setVendedorSeleccionado(null);
    };

    const actualizarAreaCliente = (vendedorUid, zfUid, ctUid, valor) => {
        setData(prev => ({
            ...prev,
            vendedores: prev.vendedores.map(vend =>
                vend.uid !== vendedorUid ? vend : {
                    ...vend,
                    zafras: vend.zafras.map(zf =>
                        zf.uid !== zfUid ? zf : {
                            ...zf,
                            clientes: zf.clientes.map(ct =>
                                ct.uid !== ctUid ? ct : { ...ct, areacultivo: valor }
                            )
                        }
                    )
                }
            )
        }));
    };

    const actualizarProducto = (vendedorUid, zfUid, ctUid, prUid, campo, valor) => {
        setData(prev => ({
            ...prev,
            vendedores: prev.vendedores.map(vend =>
                vend.uid !== vendedorUid ? vend : {
                    ...vend,
                    zafras: vend.zafras.map(zf =>
                        zf.uid !== zfUid ? zf : {
                            ...zf,
                            clientes: zf.clientes.map(ct =>
                                ct.uid !== ctUid ? ct : {
                                    ...ct,
                                    productos: ct.productos.map(pr =>
                                        pr.uid !== prUid ? pr : { ...pr, [campo]: valor }
                                    )
                                }
                            )
                        }
                    )
                }
            )
        }));
    };

    const handleSelectZafra = (id) => {
        setSelectedZafras(prev => {
            if (prev.includes(id)) return prev.filter(z => z !== id);
            return [...prev, id];
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setLoading(true);

        let sw = 0;
        if (!datos.descripcion) {
            setDescError(true);
            sw = 1;
        } else setDescError(false);

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            setLoading(false);
            return;
        }

        if (form.checkValidity()) {

            const newDatos = {
                ...datos,
                data: JSON.stringify(data),
                fechaactualizacion: new Date(),
                usuario: userLog
            }

            if (newDatos.id) {
                await updateReport(newDatos.id, newDatos);
                await AddAccess('Modificar', newDatos.id, userLog, "Datas");
            } else {
                const nuevo = await saveReport(newDatos);
                await AddAccess('Insertar', nuevo.saved.id, userLog, "Datas");
            }

            form.classList.remove('was-validated');
        } else form.classList.add('was-validated');
        setLoading(false);
        setClose(true);
    }

    return (
        <>

            {loading && (
                <Loading />
            )}
            {close && (
                <Close confirmar={confirmarEscape} title={'Data'} gen={true} />
            )}

            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'PLANEAMIENTOS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        {/* Header del perfil */}
                        <div className="extend-header">
                            <div className="security-icon">
                                <i className="bi bi-clipboard-data"></i>
                            </div>
                            <h2 className="m-0" style={{ fontSize: '24px', fontWeight: '700' }}>
                                Datas
                            </h2>
                            <p className="m-0 mt-2 opacity-90" style={{ fontSize: '16px' }}>
                                Realizar el registro del data
                            </p>
                        </div>
                        <form
                            action="url.ph"
                            onSubmit={handleSubmit}
                            className="needs-validation"
                            noValidate
                        >
                            <div className="form-body">
                                {/* Sección de Información de Cuenta */}
                                <h3 className="section-title">
                                    <i className="bi bi-shield-check input-icon"></i>
                                    Datos del Registro
                                </h3>
                                <div className="form-section">
                                    <div className="modern-input-group">
                                        <label htmlFor="descripcion" className="modern-label">
                                            <i className="bi bi-card-text me-2"></i>Descripción *
                                        </label>
                                        <input
                                            type="text"
                                            id="descripcion"
                                            name="descripcion"
                                            placeholder="Ingresa una descripcion"
                                            className={`modern-input ${descError ? 'error' : ''}`}
                                            value={datos.descripcion}
                                            onChange={(event) => setDatos({ ...datos, [event.target.name]: event.target.value })}
                                            maxLength={150}
                                            disabled={!modoEdicion}
                                        />
                                        {descError && (
                                            <div className="error-message">
                                                <i className="bi bi-exclamation-triangle-fill"></i>
                                                La descripción es obligatoria (máx. 150 caracteres)
                                            </div>
                                        )}
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="modern-input-group">
                                                <label htmlFor="apellido" className="modern-label">
                                                    <i className="bi bi-check2-square me-2"></i>Estado
                                                </label>
                                                <select
                                                    className="modern-input"
                                                    id="estado"
                                                    name="estado"
                                                    value={datos.estado ? datos.estado : ''}
                                                    onChange={(event) => setDatos({ ...datos, [event.target.name]: event.target.value })}
                                                    disabled={!datos.id || !modoEdicion}
                                                    required
                                                >
                                                    <option value="" className="bg-secondary-subtle">Seleccione un estado...</option>
                                                    <option key={1} value={'Aprobado'}>Aprobado</option>
                                                    <option key={2} value={'Borrador'}>Borrador</option>
                                                </select>
                                                <div className="invalid-feedback text-danger text-start">
                                                    <i className="bi bi-exclamation-triangle-fill m-2"></i>El estado es obligatorio.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="modern-input-group">
                                                <label htmlFor="fechacreacion" className="modern-label">
                                                    <i className="bi bi-calendar me-2"></i>Fecha de Creación
                                                </label>
                                                <input
                                                    type="date"
                                                    id="fechacreacion"
                                                    name="fechacreacion"
                                                    className="modern-input"
                                                    value={formatearFechaParaInput(datos.fechacreacion)}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="section-title">
                                    <i className="bi bi-shield-check input-icon"></i>
                                    Generación de Datos
                                </h3>
                                {/* Sección de selección de zafras */}
                                <div className="modern-input-group">
                                    <label className="modern-label">
                                        <i className="bi bi-brightness-alt-high me-2"></i>Seleccionar Zafras
                                    </label>
                                    <div className="dropdown mb-3">
                                        <button
                                            className="modern-button btn-primary dropdown-toggle w-100 justify-content-center"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            disabled={!modoEdicion}
                                        >
                                            {selectedZafras.length > 0
                                                ? `${selectedZafras.length} Seleccionados`
                                                : "Lista de Zafras"}
                                        </button>
                                        <ul className="dropdown-menu p-2 w-100 border-2 border-black" style={{ maxHeight: '300px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                                            {/* Botón de seleccionar todo */}
                                            <li className="pb-2 border-bottom mb-2">
                                                <button
                                                    className="btn btn-success w-100 py-1"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (selectedZafras.length === zafras.length) {
                                                            // desmarcar todo
                                                            setSelectedZafras([]);
                                                        } else {
                                                            // seleccionar todos
                                                            setSelectedZafras(zafras.map(z => z.id));
                                                        }
                                                    }}
                                                >
                                                    {selectedZafras.length === zafras.length
                                                        ? "Desmarcar todos"
                                                        : "Seleccionar todos"
                                                    }
                                                </button>
                                            </li>

                                            {/* Lista de zafras */}
                                            {zafras.map(z => (
                                                <li key={z.id}>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            value={z.id}
                                                            id={`zaf-${z.id}`}
                                                            checked={selectedZafras.includes(z.id)}
                                                            onChange={() => handleSelectZafra(z.id)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`func-${z.id}`}>
                                                            {z.descripcion}
                                                        </label>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className='modern-input-group'>
                                    <label className="modern-label">
                                        <i className="bi bi-people me-2"></i>Seleccionar Vendedores
                                    </label>
                                    <AutocompleteSelect
                                        options={vendedores}
                                        value={vendedorSeleccionado}
                                        getLabel={(v) => v.nomape}
                                        searchFields={[
                                            v => v.nomape,
                                            v => v.nrodoc
                                        ]}
                                        onChange={(v) => {
                                            setVendedorSeleccionado(v);
                                            if (!v) return;
                                            agregarVendedor(v);
                                        }}
                                        className="modern-input"
                                        disabled={!modoEdicion}
                                    />
                                </div>

                                {data.vendedores && data.vendedores.map(vd => (
                                    <div key={vd.uid} className="mb-2">

                                        {/* VENDEDOR */}
                                        <button type='button' className="btn rounded-0 btn-success w-100"
                                            onClick={() => toggle(vd.uid)}>
                                            {vd.nomape}
                                            <i className={`bi float-end ${open[vd.uid] ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                                        </button>

                                        {open[vd.uid] && (
                                            <div className="bg-success-subtle">
                                                {vd.zafras && vd.zafras.map(zf => (
                                                    <div key={zf.uid} className="p-2 mb-2">

                                                        {/* ZAFRA */}
                                                        <button type='button' className="btn rounded-0 btn-warning w-100"
                                                            onClick={() => toggle(zf.uid)}>
                                                            Zafra: {zf.zafra}
                                                            <i className={`bi float-end ${open[zf.uid] ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                                                        </button>

                                                        {open[zf.uid] && (
                                                            <div className="bg-warning-subtle p-2">
                                                                {zf.clientes && zf.clientes.map(ct => (
                                                                    <div key={ct.uid} className="mb-2">

                                                                        {/* CLIENTE */}
                                                                        <button
                                                                            type='button'
                                                                            className="btn rounded-0 btn-info w-100 d-flex justify-content-between align-items-center"
                                                                            onClick={() => toggle(ct.uid)}
                                                                        >
                                                                            <span>{ct.nomape}</span>
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm"
                                                                                    placeholder="Área cultivo"
                                                                                    value={ct.areacultivo}
                                                                                    onChange={e => {
                                                                                        e.stopPropagation(); // Evitar que se cierre/abra al editar
                                                                                        actualizarAreaCliente(
                                                                                            vd.uid,
                                                                                            zf.uid,
                                                                                            ct.uid,
                                                                                            Number(e.target.value)
                                                                                        );
                                                                                    }}
                                                                                    onClick={e => e.stopPropagation()} // Evitar que se cierre/abra al hacer click
                                                                                    disabled={!modoEdicion}
                                                                                    style={{ width: '120px' }}
                                                                                />
                                                                                <i className={`bi ${open[ct.uid] ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                                                                            </div>
                                                                        </button>

                                                                        {/* TABLA DE PRODUCTOS */}
                                                                        {open[ct.uid] && (
                                                                            <div className="bg-info-subtle p-2">
                                                                                <table className="table table-sm table-bordered table-hover m-0">
                                                                                    <thead className="table-dark text-center">
                                                                                        <tr>
                                                                                            <th>Grupo</th>
                                                                                            <th>Producto</th>
                                                                                            <th>Principio Activo</th>
                                                                                            <th>Dosis Ajustada</th>
                                                                                            <th>Vol. Potencial</th>
                                                                                            <th>Vol. Planeado</th>
                                                                                            <th>% Participación</th>
                                                                                            <th>Precio Medio</th>
                                                                                            <th>Área Planeada</th>
                                                                                            <th>Planeados</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {ct.productos && ct.productos.map(pr => {
                                                                                            const volpotencial = pr.dosis * ct.areacultivo;
                                                                                            const porcenparti = volpotencial ? pr.volplaneado / volpotencial : 0;
                                                                                            const areaplaneada = porcenparti * ct.areacultivo;
                                                                                            const planeados = pr.volplaneado * pr.precio;

                                                                                            return (
                                                                                                <tr key={pr.uid}>
                                                                                                    <td>{pr.grupoproducto}</td>
                                                                                                    <td>{pr.nombre}</td>
                                                                                                    <td>{pr.principioactivo}</td>
                                                                                                    <td>
                                                                                                        <input
                                                                                                            type="number"
                                                                                                            className="form-control form-control-sm"
                                                                                                            value={pr.dosis}
                                                                                                            onChange={e => actualizarProducto(
                                                                                                                vd.uid,
                                                                                                                zf.uid,
                                                                                                                ct.uid,
                                                                                                                pr.uid,
                                                                                                                'dosis',
                                                                                                                Number(e.target.value)
                                                                                                            )}
                                                                                                            disabled={!modoEdicion}
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td className="text-end">{volpotencial.toFixed(2)}</td>
                                                                                                    <td>
                                                                                                        <input
                                                                                                            type="number"
                                                                                                            className="form-control form-control-sm"
                                                                                                            value={pr.volplaneado}
                                                                                                            onChange={e => actualizarProducto(
                                                                                                                vd.uid,
                                                                                                                zf.uid,
                                                                                                                ct.uid,
                                                                                                                pr.uid,
                                                                                                                'volplaneado',
                                                                                                                Number(e.target.value)
                                                                                                            )}
                                                                                                            disabled={!modoEdicion}
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td className="text-end">{(porcenparti * 100).toFixed(2)}%</td>
                                                                                                    <td>
                                                                                                        <input
                                                                                                            type="number"
                                                                                                            className="form-control form-control-sm"
                                                                                                            value={pr.precio}
                                                                                                            onChange={e => actualizarProducto(
                                                                                                                vd.uid,
                                                                                                                zf.uid,
                                                                                                                ct.uid,
                                                                                                                pr.uid,
                                                                                                                'precio',
                                                                                                                Number(e.target.value)
                                                                                                            )}
                                                                                                            disabled={!modoEdicion}
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td className='text-end'>{areaplaneada.toFixed(2)}</td>
                                                                                                    <td className='text-end'>{planeados.toFixed(2)}</td>
                                                                                                </tr>
                                                                                            );
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className='div-report-button'>
                                <button type='submit' className="modern-button btn-primary">
                                    <i className="bi bi-check-lg"></i>Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            </div >
        </>
    );
}

export default Data;
