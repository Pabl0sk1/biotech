import { useEffect, useState } from 'react';
import { getEntity } from '../services/entidad.service';
import { getProduct } from '../services/producto.service';
import { getHarvest } from '../services/zafra.service';
import Header from '../Header';
import AutocompleteSelect from '../AutocompleteSelect.jsx';

const uid = () => crypto.randomUUID();

export const Planeamiento = ({ userLog }) => {

    const [clientes, setClientes] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);
    const [productos, setProductos] = useState([]);
    const [zafras, setZafras] = useState([]);
    const [selectedZafras, setSelectedZafras] = useState([]);
    const [planeamiento, setPlaneamiento] = useState([]);
    const [open, setOpen] = useState({});

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
    }, []);

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
        const vendedorconZafras = {
            ...vendedor,
            zafras: zafrasConClientes
        };

        // Agregar nuevo vendedor
        const nuevo = {
            uid: uid(),
            vendedor: vendedorconZafras
        };

        // Guardar en planeamiento
        setPlaneamiento(p => {
            if (p.some(x => x.vendedor.erpid === vendedor.erpid)) return p;
            return [...p, nuevo];
        });
    };

    const actualizarAreaCliente = (plUid, zfUid, ctUid, valor) => {
        setPlaneamiento(prev =>
            prev.map(pl =>
                pl.uid !== plUid ? pl : {
                    ...pl,
                    vendedor: {
                        ...pl.vendedor,
                        zafras: pl.vendedor.zafras.map(zf =>
                            zf.uid !== zfUid ? zf : {
                                ...zf,
                                clientes: zf.clientes.map(ct =>
                                    ct.uid !== ctUid
                                        ? ct
                                        : { ...ct, areacultivo: valor }
                                )
                            }
                        )
                    }
                }
            )
        );
    };

    const actualizarProducto = (plUid, zfUid, ctUid, prUid, campo, valor) => {
        setPlaneamiento(prev =>
            prev.map(pl =>
                pl.uid !== plUid ? pl : {
                    ...pl,
                    vendedor: {
                        ...pl.vendedor,
                        zafras: pl.vendedor.zafras.map(zf =>
                            zf.uid !== zfUid ? zf : {
                                ...zf,
                                clientes: zf.clientes.map(ct =>
                                    ct.uid !== ctUid ? ct : {
                                        ...ct,
                                        productos: ct.productos.map(pr =>
                                            pr.uid !== prUid
                                                ? pr
                                                : { ...pr, [campo]: valor }
                                        )
                                    }
                                )
                            }
                        )
                    }
                }
            )
        );
    };

    const handleSelectZafra = (id) => {
        setSelectedZafras(prev => {
            if (prev.includes(id)) return prev.filter(z => z !== id);
            return [...prev, id];
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        console.log(planeamiento);

        if (form.checkValidity()) {
            form.classList.remove('was-validated');
        } else form.classList.add('was-validated');
    }

    return (
        <>
            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'PLANEAMIENTO'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
                <div className="container-fluid p-4 mt-2">
                    <div className="form-card mt-5">
                        {/* Header del perfil */}
                        <div className="extend-header">
                            <div className="security-icon">
                                <i className="bi bi-clipboard-data"></i>
                            </div>
                            <h2 className="m-0" style={{ fontSize: '24px', fontWeight: '700' }}>
                                Reportes
                            </h2>
                            <p className="m-0 mt-2 opacity-90" style={{ fontSize: '16px' }}>
                                Realizar reporte de planeamiento
                            </p>
                        </div>
                        <form
                            action="url.ph"
                            onSubmit={handleSubmit}
                            className="needs-validation"
                            noValidate
                        >
                            <label htmlFor="vendedor" className="form-label mx-2">Vendedores</label>
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
                            />
                            <div className="form-body">

                                {/* Sección de selección de zafras */}
                                <div className="modern-input-group">
                                    <label className="modern-label">
                                        <i className="bi bi-people me-2"></i>Seleccionar Zafras
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

                                            {/* Lista de funcionarios */}
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

                                {planeamiento.map(pl => (
                                    <div key={pl.uid} className="mb-2">

                                        {/* VENDEDOR */}
                                        <button type='button' className="btn rounded-0 btn-success w-100"
                                            onClick={() => toggle(pl.uid)}>
                                            {pl.vendedor?.nomape}
                                            <i className={`bi float-end ${open[pl.uid] ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                                        </button>

                                        {open[pl.uid] && (
                                            <div className="bg-success-subtle">

                                                {pl.vendedor?.zafras.map(zf => (
                                                    <div key={zf.uid} className="p-2 mb-2">
                                                        <strong>Zafra: {zf.zafra}</strong>

                                                        {zf.clientes.map(ct => (
                                                            <div key={ct.uid} className="border mt-2 p-2">
                                                                <div className="d-flex gap-2 align-items-center">
                                                                    <strong>{ct.nomape}</strong>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control w-25"
                                                                        placeholder="Área cultivo"
                                                                        value={ct.areacultivo}
                                                                        onChange={e =>
                                                                            actualizarAreaCliente(
                                                                                pl.uid,
                                                                                zf.uid,
                                                                                ct.uid,
                                                                                Number(e.target.value)
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <table className="table table-sm table-bordered mt-2">
                                                                    <thead className="table-dark text-center">
                                                                        <tr>
                                                                            <th>Grupo</th>
                                                                            <th>Producto</th>
                                                                            <th>Principio Activo</th>
                                                                            <th>Dosis Ajustada</th>
                                                                            <th>Vol. Potencial</th>
                                                                            <th>Vol. Planeado</th>
                                                                            <th>% de Participación del Producto</th>
                                                                            <th>Precio Medio</th>
                                                                            <th>Área Planeada</th>
                                                                            <th>Planeados</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {ct.productos.map(pr => {
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
                                                                                            className="form-control"
                                                                                            value={pr.dosis}
                                                                                            onChange={e => actualizarProducto(
                                                                                                pl.uid,
                                                                                                zf.uid,
                                                                                                ct.uid,
                                                                                                pr.uid,
                                                                                                'dosis',
                                                                                                Number(e.target.value)
                                                                                            )}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="text-end">{volpotencial}</td>
                                                                                    <td>
                                                                                        <input
                                                                                            type="number"
                                                                                            className="form-control"
                                                                                            value={pr.volplaneado}
                                                                                            onChange={e => actualizarProducto(
                                                                                                pl.uid,
                                                                                                zf.uid,
                                                                                                ct.uid,
                                                                                                pr.uid,
                                                                                                'volplaneado',
                                                                                                Number(e.target.value)
                                                                                            )}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="text-end">{(porcenparti * 100)}%</td>
                                                                                    <td>
                                                                                        <input
                                                                                            type="number"
                                                                                            className="form-control"
                                                                                            value={pr.precio}
                                                                                            onChange={e => actualizarProducto(
                                                                                                pl.uid,
                                                                                                zf.uid,
                                                                                                ct.uid,
                                                                                                pr.uid,
                                                                                                'precio',
                                                                                                Number(e.target.value)
                                                                                            )}
                                                                                        />
                                                                                    </td>
                                                                                    <td className='text-end'>{areaplaneada}</td>
                                                                                    <td className='text-end'>{planeados}</td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>

                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className='div-report-button'>
                                <button type='submit' className="btn btn-primary border-0 btn-lg">
                                    <i className="bi bi-printer-fill me-2"></i>Generar
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
