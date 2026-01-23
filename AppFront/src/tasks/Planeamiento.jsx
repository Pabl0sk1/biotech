import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import { saveReport, updateReport } from '../services/informe.service.js';
import { getEntity } from '../services/entidad.service.js';
import { getProduct } from '../services/producto.service.js';
import { getProductGroup } from '../services/grupoproducto.service.js';
import { getHarvest } from '../services/zafra.service.js';
import { AddAccess } from '../utils/AddAccess.js';
import Header from '../Header';
import AutocompleteSelect from '../AutocompleteSelect.jsx';
import Loading from "../layouts/Loading";
import Close from "../layouts/Close";

export const Planeamiento = () => {

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
    const [subgrupos, setSubgrupos] = useState([]);
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
            const zaf = await getHarvest();
            const ven = await getEntity('', '', '', 'categorias:contains:Vendedor;activo:eq:true');
            const cli = await getEntity('', '', '', 'categorias:contains:Cliente;activo:eq:true');
            const pro = await getProduct('', '', 'nombrecomercial.subgrupoproducto.subgrupoproducto,asc', 'activo:eq:true;incluirplan:eq:true');
            const sub = await getProductGroup('', '', 'subgrupoproducto,asc', '', 'subgroups');

            const subgrupos = sub.items.filter(s =>
                pro.items.some(p =>
                    s.id === p.nombrecomercial?.subgrupoproducto?.id
                )
            );

            setZafras(zaf.items);
            setVendedores(ven.items);
            setClientes(cli.items.filter(v => v.cartera));
            setProductos(pro.items);
            setSubgrupos(subgrupos);
        };
        load();

        if (datos?.data) {
            try {
                const dataParsed = typeof datos.data === 'string'
                    ? JSON.parse(datos.data)
                    : datos.data;
                setData(dataParsed);

                // Restaurar zafras seleccionadas
                if (Array.isArray(dataParsed.zafras)) {
                    setSelectedZafras(dataParsed.zafras);
                }
            } catch (error) {
                console.error('Error al parsear datos del informe:', error);
                setData(initial);
            }
        }
    }, [datos]);

    useEffect(() => {
        setData(prev => ({
            ...prev,
            zafras: selectedZafras
        }));
    }, [selectedZafras]);

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
        if (!selectedZafras.length) {
            setVendedorSeleccionado(null);
            return;
        }

        // Obtener clientes del vendedor
        const clientesList = clientesPorVendedor(vendedor.erpid);

        // Mapear grupos de productos para los clientes
        const subgrupoConProductos = subgrupos.map(s => ({
            uid: uid(),
            grupo: s.grupoproductotxt,
            subgrupo: s.subgrupoproducto,
            totalplaneados: 0,
            productos: productos.filter(p => p.nombrecomercial?.subgrupoproducto?.id == s.id).map(p => ({
                uid: uid(),
                nombre: p.nombrecomercial?.nombrecomercial,
                principioactivo: p.principioactivo?.principioactivo,
                dosis: p.dosisporhec || 0,
                volpotencial: 0,
                volplaneado: 0,
                porcenparti: 0,
                precio: p.precio || 0,
                areaplaneada: 0,
                planeados: 0
            }))
        }));

        // Mapear clientes para agregar campos necesarios y productos
        const clientesConSubgrupos = clientesList.map(c => ({
            uid: uid(),
            nomape: c.nomape,
            nombre: c.nombre,
            apellido: c.apellido,
            nrodoc: c.nrodoc,
            areacultivo: '',
            totalplaneados: 0,
            subgrupos: subgrupoConProductos
        }));

        // Mapear zafras para agregar clientes
        const zafrasConClientes = zafras
            .filter(z => selectedZafras.includes(z.id))
            .map(z => ({
                uid: uid(),
                zafra: z.descripcion,
                totalplaneados: 0,
                clientes: clientesConSubgrupos
            }));

        // Armar el vendedor con sus zafras adentro
        const vendedorConZafras = {
            ...vendedor,
            uid: uid(),
            totalplaneados: 0,
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

    const calcularTotalSubgrupo = (subgrupo) => {
        if (!subgrupo.productos) return 0;
        return subgrupo.productos.reduce((sum, pr) => {
            const planeados = pr.volplaneado * pr.precio;
            return sum + planeados;
        }, 0);
    }

    const calcularTotalCliente = (cliente) => {
        if (!cliente.subgrupos) return 0;
        return cliente.subgrupos.reduce((sum, sg) => {
            return sum + calcularTotalSubgrupo(sg);
        }, 0);
    };

    const calcularTotalZafra = (zafra) => {
        if (!zafra.clientes) return 0;
        return zafra.clientes.reduce((sum, ct) => {
            return sum + calcularTotalCliente(ct);
        }, 0);
    };

    const calcularTotalVendedor = (vendedor) => {
        if (!vendedor.zafras) return 0;
        return vendedor.zafras.reduce((sum, zf) => {
            return sum + calcularTotalZafra(zf);
        }, 0);
    };

    // Modifica actualizarAreaCliente para recalcular totales después de actualizar:
    const actualizarAreaCliente = (vendedorUid, zfUid, ctUid, valor) => {
        setData(prev => {
            const newData = {
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
            };

            // Recalcular totales en el nuevo estado
            return {
                ...newData,
                vendedores: newData.vendedores.map(vend => ({
                    ...vend,
                    totalplaneados: calcularTotalVendedor(vend),
                    zafras: vend.zafras.map(zf => ({
                        ...zf,
                        totalplaneados: calcularTotalZafra(zf),
                        clientes: zf.clientes.map(ct => ({
                            ...ct,
                            totalplaneados: calcularTotalCliente(ct)
                        }))
                    }))
                }))
            };
        });
    };

    // Modifica actualizarProducto para recalcular totales después de actualizar:
    const actualizarProducto = (vendedorUid, zfUid, ctUid, sgUid, prUid, campo, valor) => {
        setData(prev => {
            const newData = {
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
                                        subgrupos: ct.subgrupos.map(sg =>
                                            sg.uid !== sgUid ? sg : {
                                                ...sg,
                                                productos: sg.productos.map(pr =>
                                                    pr.uid !== prUid ? pr : { ...pr, [campo]: valor }
                                                )
                                            }
                                        )
                                    }
                                )
                            }
                        )
                    }
                )
            };

            // Recalcular totales en el nuevo estado
            return {
                ...newData,
                vendedores: newData.vendedores.map(vend => ({
                    ...vend,
                    totalplaneados: calcularTotalVendedor(vend),
                    zafras: vend.zafras.map(zf => ({
                        ...zf,
                        totalplaneados: calcularTotalZafra(zf),
                        clientes: zf.clientes.map(ct => ({
                            ...ct,
                            totalplaneados: calcularTotalCliente(ct),
                            subgrupos: ct.subgrupos.map(sg => ({
                                ...sg,
                                totalplaneados: calcularTotalSubgrupo(sg)
                            }))
                        }))
                    }))
                }))
            };
        });
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
                                Planeamientos
                            </h2>
                            <p className="m-0 mt-2 opacity-90" style={{ fontSize: '16px' }}>
                                Realizar el registro del planeamiento
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
                                                            disabled={!modoEdicion}
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
                                {modoEdicion && (
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
                                            size={3}
                                            onChange={(v) => {
                                                setVendedorSeleccionado(v);
                                                if (!v) return;
                                                agregarVendedor(v);
                                            }}
                                            className="modern-input"
                                        />
                                    </div>
                                )}

                                {data.vendedores && data.vendedores.map(vd => {
                                    const totalVendedor = calcularTotalVendedor(vd);

                                    return (
                                        <div key={vd.uid} className="mb-2">

                                            {/* VENDEDOR */}
                                            <div className="text-end pe-2 pb-1">
                                                <small className="badge bg-success text-dark fw-bold">
                                                    Total Vendedor: $ {totalVendedor.toLocaleString('es-PY', { minimumFractionDigits: 2 })}
                                                </small>
                                            </div>
                                            <button type='button' className="btn rounded-0 btn-success w-100 fw-bold text-dark"
                                                onClick={() => toggle(vd.uid)}>
                                                {vd.nomape}
                                                <i className={`bi float-end ${open[vd.uid] ? 'bi-arrow-up-circle-fill' : 'bi-arrow-down-circle-fill'} fs-5`} />
                                            </button>

                                            {open[vd.uid] && (
                                                <div className="bg-success-subtle">
                                                    {vd.zafras && vd.zafras.map(zf => {
                                                        const totalZafra = calcularTotalZafra(zf);

                                                        return (
                                                            <div key={zf.uid} className="p-2 mb-2">

                                                                {/* ZAFRA */}
                                                                <div className="text-end pe-2 pb-1">
                                                                    <small className="badge bg-warning text-dark fw-bold">
                                                                        Total Zafra: $ {totalZafra.toLocaleString('es-PY', { minimumFractionDigits: 2 })}
                                                                    </small>
                                                                </div>
                                                                <button type='button' className="btn rounded-0 btn-warning w-100 fw-medium"
                                                                    onClick={() => toggle(zf.uid)}>
                                                                    {zf.zafra}
                                                                    <i className={`bi float-end ${open[zf.uid] ? 'bi-arrow-up-circle-fill' : 'bi-arrow-down-circle-fill'} fs-5`} />
                                                                </button>

                                                                {open[zf.uid] && (
                                                                    <div className="bg-warning-subtle p-2">
                                                                        {zf.clientes && zf.clientes.map(ct => {
                                                                            const totalCliente = calcularTotalCliente(ct);

                                                                            return (
                                                                                <div key={ct.uid} className="mb-2">

                                                                                    {/* CLIENTE */}
                                                                                    <div className="text-end pe-2 pb-1">
                                                                                        <small className="badge bg-info text-dark fw-bold">
                                                                                            Total Cliente: $ {totalCliente.toLocaleString('es-PY', { minimumFractionDigits: 2 })}
                                                                                        </small>
                                                                                    </div>
                                                                                    <button
                                                                                        type='button'
                                                                                        className="btn rounded-0 btn-info w-100 fw-medium d-flex justify-content-between align-items-center"
                                                                                        onClick={() => toggle(ct.uid)}
                                                                                    >
                                                                                        <span>{ct.nomape}</span>
                                                                                        <div className="d-flex align-items-center gap-2">
                                                                                            <input
                                                                                                type="number"
                                                                                                min={0}
                                                                                                className="form-control form-control-sm"
                                                                                                placeholder="Área de Cultivo"
                                                                                                value={ct.areacultivo ?? ''}
                                                                                                onChange={e => {
                                                                                                    e.stopPropagation();
                                                                                                    const value = e.target.value;
                                                                                                    actualizarAreaCliente(
                                                                                                        vd.uid,
                                                                                                        zf.uid,
                                                                                                        ct.uid,
                                                                                                        value === '' ? '' : Math.max(0, Number(value))
                                                                                                    );
                                                                                                }}
                                                                                                onClick={e => e.stopPropagation()}
                                                                                                disabled={!modoEdicion}
                                                                                                style={{ width: '120px' }}
                                                                                            />
                                                                                            <i className={`bi ${open[ct.uid] ? 'bi-arrow-up-circle-fill' : 'bi-arrow-down-circle-fill'} fs-5`} />
                                                                                        </div>
                                                                                    </button>

                                                                                    {open[ct.uid] && (
                                                                                        <div className="bg-info-subtle p-2">

                                                                                            <div key={ct.uid} className="mb-2">
                                                                                                <table className="table table-sm table-bordered table-hover m-0">
                                                                                                    <thead className="table-dark text-center align-middle">
                                                                                                        <tr>
                                                                                                            <th>Subgrupo</th>
                                                                                                            <th>Producto</th>
                                                                                                            <th>Principio Activo</th>
                                                                                                            <th>Dosis Ajustada</th>
                                                                                                            <th>Vol. Potencial</th>
                                                                                                            <th>Vol. Planeado</th>
                                                                                                            <th>% Participación de Producto</th>
                                                                                                            <th>Precio Medio</th>
                                                                                                            <th>Área Planeada</th>
                                                                                                            <th>Precio Planeado</th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        {ct.subgrupos && ct.subgrupos.flatMap(sg =>
                                                                                                            sg.productos && sg.productos.map(pr => {
                                                                                                                const volpotencial = pr.dosis * ct.areacultivo;
                                                                                                                const porcenparti = volpotencial ? pr.volplaneado / volpotencial : 0;
                                                                                                                const areaplaneada = porcenparti * ct.areacultivo;
                                                                                                                const planeados = pr.volplaneado * pr.precio;

                                                                                                                return (
                                                                                                                    <tr key={pr.uid}>
                                                                                                                        <td>{sg.subgrupo}</td>
                                                                                                                        <td>{pr.nombre}</td>
                                                                                                                        <td>{pr.principioactivo}</td>
                                                                                                                        <td>
                                                                                                                            <input
                                                                                                                                type="number"
                                                                                                                                min={0}
                                                                                                                                className="form-control form-control-sm"
                                                                                                                                placeholder='Dosis'
                                                                                                                                value={pr.dosis ?? ''}
                                                                                                                                onChange={e => {
                                                                                                                                    e.stopPropagation();
                                                                                                                                    const value = e.target.value;
                                                                                                                                    actualizarProducto(
                                                                                                                                        vd.uid,
                                                                                                                                        zf.uid,
                                                                                                                                        ct.uid,
                                                                                                                                        sg.uid,
                                                                                                                                        pr.uid,
                                                                                                                                        'dosis',
                                                                                                                                        value === '' ? '' : Math.max(0, Number(value))
                                                                                                                                    )
                                                                                                                                }}
                                                                                                                                disabled={!modoEdicion}
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="text-end">{volpotencial.toFixed(2)}</td>
                                                                                                                        <td>
                                                                                                                            <input
                                                                                                                                type="number"
                                                                                                                                min={0}
                                                                                                                                className="form-control form-control-sm"
                                                                                                                                placeholder='Volumen'
                                                                                                                                value={pr.volplaneado ?? ''}
                                                                                                                                onChange={e => {
                                                                                                                                    e.stopPropagation();
                                                                                                                                    const value = e.target.value;
                                                                                                                                    actualizarProducto(
                                                                                                                                        vd.uid,
                                                                                                                                        zf.uid,
                                                                                                                                        ct.uid,
                                                                                                                                        sg.uid,
                                                                                                                                        pr.uid,
                                                                                                                                        'volplaneado',
                                                                                                                                        value === '' ? '' : Math.max(0, Number(value))
                                                                                                                                    )
                                                                                                                                }}
                                                                                                                                disabled={!modoEdicion}
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className="text-end">{(porcenparti * 100).toFixed(2)}%</td>
                                                                                                                        <td>
                                                                                                                            <NumericFormat
                                                                                                                                allowNegative={false}
                                                                                                                                displayType="input"
                                                                                                                                thousandSeparator="."
                                                                                                                                decimalSeparator=","
                                                                                                                                decimalScale={2}
                                                                                                                                fixedDecimalScale={true}
                                                                                                                                className="form-control form-control-sm"
                                                                                                                                placeholder='Precio'
                                                                                                                                value={pr.precio ?? 0}
                                                                                                                                onValueChange={({ floatValue }) => {
                                                                                                                                    actualizarProducto(
                                                                                                                                        vd.uid,
                                                                                                                                        zf.uid,
                                                                                                                                        ct.uid,
                                                                                                                                        sg.uid,
                                                                                                                                        pr.uid,
                                                                                                                                        'precio',
                                                                                                                                        floatValue ?? 0
                                                                                                                                    )
                                                                                                                                }}
                                                                                                                                disabled={!modoEdicion}
                                                                                                                            />
                                                                                                                        </td>
                                                                                                                        <td className='text-end'>{areaplaneada.toFixed(2)}</td>
                                                                                                                        <td className='text-end'>{planeados.toFixed(2)}</td>
                                                                                                                    </tr>
                                                                                                                );
                                                                                                            })
                                                                                                        )}
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className='div-report-button'>
                                <button type='submit' className="btn btn-secondary bg-success modern-button" disabled={!modoEdicion}>
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

export default Planeamiento;
