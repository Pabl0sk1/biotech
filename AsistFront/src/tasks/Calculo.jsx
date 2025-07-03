import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getFuncionario } from '../services/funcionario.service';
import { generarExcel } from './ArchivoExcel';

export const Calculo = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

    const obtenerFechasDelMes = () => {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = ahora.getMonth();

        // Primer día del mes
        const primerDia = new Date(año, mes, 1);
        // Último día del mes
        const ultimoDia = new Date(año, mes + 1, 0);

        // Cantidad
        const cant = ultimoDia.getDate();

        // Formatear las fechas para input tipo date (YYYY-MM-DD)
        const formDate = (fecha) => {
            return fecha.toISOString().split('T')[0];
        };

        return {
            fechadesde: formDate(primerDia),
            fechahasta: formDate(ultimoDia),
            cantdias: cant
        };
    };

    // Función para calcular días entre dos fechas
    const calcularDiasEnRango = (fechaDesde, fechaHasta) => {
        if (!fechaDesde || !fechaHasta) return 0;
        const inicio = new Date(fechaDesde);
        const fin = new Date(fechaHasta);
        const diferencia = fin.getTime() - inicio.getTime();
        return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha + 'T00:00:00Z');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    // Función para parsear fecha del CSV (DD/MM/YYYY HH:MM)
    const parsearFechaCSV = (fechaHoraStr) => {
        if (!fechaHoraStr || fechaHoraStr.trim() === '') return null;

        try {
            // Formato esperado: "02/06/2025 05:53"
            const [fechaPart, horaPart] = fechaHoraStr.trim().split(' ');
            const [dia, mes, año] = fechaPart.split('/');

            return {
                fecha: `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`,
                hora: horaPart
            };
        } catch (error) {
            console.error('Error parseando fecha:', fechaHoraStr, error);
            return null;
        }
    };

    // Función para procesar el archivo CSV
    const procesarCSV = (csvText) => {
        const lineas = csvText.split('\n');
        const asistencias = [];
        let funcionarioActual = null;

        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;

            const campos = linea.split(';');
            let filtrados = campos.filter(dato => dato !== "");
            console.log(filtrados)
            // Detectar línea de funcionario (contiene ID y Nombre)
            if (campos[1] === 'ID') {
                const id = parseInt(campos[2]);

                if (!isNaN(id)) {
                    funcionarioActual = {
                        id: id,
                        asistencias: []
                    };
                    asistencias.push(funcionarioActual);
                }
                continue;
            }
            console.log(funcionarioActual)
            // Procesar líneas de registros de entrada/salida
            if (funcionarioActual) {
                // Procesar cada par de fecha-hora en la línea
                for (let j = 1; j < campos.length; j += 4) {
                    if (j + 2 < campos.length) {
                        const fechaHora = campos[j];
                        const tipo = campos[j + 2]; // "Entrada" o "Salida"

                        if (fechaHora && tipo && (tipo.includes('Entrada') || tipo.includes('Salida'))) {
                            const parsedDateTime = parsearFechaCSV(fechaHora);
                            if (parsedDateTime) {
                                funcionarioActual.asistencias.push({
                                    fecha: parsedDateTime.fecha,
                                    hora: parsedDateTime.hora,
                                    tipo: tipo.includes('Entrada') ? 'entrada' : 'salida'
                                });
                            }
                        }
                    }
                }
            }
        }

        return asistencias;
    };

    // Función para aplicar asistencias del CSV a los funcionarios
    const aplicarAsistenciasCSV = (asistenciasCSV) => {
        setData(prevData => ({
            ...prevData,
            listafuncionarios: prevData.listafuncionarios.map(funcionario => {
                // Buscar funcionario en CSV por ID o nombre
                const asistenciasFuncionario = asistenciasCSV.find(csvFunc =>
                    csvFunc.id === funcionario.codigo
                    // csvFunc.nombre.toLowerCase().includes(funcionario.nombre.toLowerCase()) ||
                    // funcionario.nombre.toLowerCase().includes(csvFunc.nombre.toLowerCase())
                );

                if (!asistenciasFuncionario) {
                    return funcionario; // No hay asistencias para este funcionario
                }

                // Agrupar asistencias por fecha
                const asistenciasPorFecha = {};
                asistenciasFuncionario.asistencias.forEach(asistencia => {
                    if (!asistenciasPorFecha[asistencia.fecha]) {
                        asistenciasPorFecha[asistencia.fecha] = {
                            entradas: [],
                            salidas: []
                        };
                    }

                    if (asistencia.tipo === 'entrada') {
                        asistenciasPorFecha[asistencia.fecha].entradas.push(asistencia.hora);
                    } else {
                        asistenciasPorFecha[asistencia.fecha].salidas.push(asistencia.hora);
                    }
                });

                // Actualizar detalles del funcionario
                const nuevosDetalles = funcionario.detalles.map(detalle => {
                    const asistenciasDia = asistenciasPorFecha[detalle.fecha];
                    if (asistenciasDia) {
                        // Tomar la primera entrada y la última salida del día
                        const horaent = asistenciasDia.entradas.length > 0 ?
                            asistenciasDia.entradas[0] : detalle.horaent;
                        const horasal = asistenciasDia.salidas.length > 0 ?
                            asistenciasDia.salidas[asistenciasDia.salidas.length - 1] : detalle.horasal;

                        return {
                            ...detalle,
                            horaent: horaent,
                            horasal: horasal
                        };
                    }
                    return detalle;
                });

                return {
                    ...funcionario,
                    detalles: nuevosDetalles
                };
            })
        }));
    };

    // Función para manejar la carga del archivo CSV
    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const asistenciasCSV = procesarCSV(csvText);

                if (asistenciasCSV.length > 0) {
                    aplicarAsistenciasCSV(asistenciasCSV);
                    setCsvStatus(`✅ CSV procesado correctamente. ${asistenciasCSV.length} funcionarios encontrados.`);
                } else {
                    setCsvStatus('⚠️ No se encontraron datos válidos en el archivo CSV.');
                }
            } catch (error) {
                console.error('Error procesando CSV:', error);
                setCsvStatus('❌ Error al procesar el archivo CSV. Verifique el formato.');
            }
        };

        reader.onerror = () => {
            setCsvStatus('❌ Error al leer el archivo.');
        };

        reader.readAsText(file, 'UTF-8');
    };

    const initial = {
        fechadesde: "",
        fechahasta: "",
        cantdias: 0,
        listafuncionarios: [],
        listaferiados: []
    };

    const [data, setData] = useState(initial);
    const [isOpen, setIsOpen] = useState({});
    const [nuevaFechaFeriado, setNuevaFechaFeriado] = useState('');
    const [csvStatus, setCsvStatus] = useState('');

    // Función para alternar la visibilidad de la barra lateral
    const toggleContent = (ID) => {
        setIsOpen(prevState => ({
            ...prevState,
            [ID]: !prevState[ID]
        }));
    };

    // Función para generar las fechas del rango seleccionado
    const generarFechasRango = (fechaDesde, fechaHasta) => {
        if (!fechaDesde || !fechaHasta) return [];

        const fechas = [];
        const fechaInicio = new Date(fechaDesde);
        const fechaFin = new Date(fechaHasta);

        for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
            const fechaStr = fecha.toISOString().split('T')[0];

            fechas.push({
                fecha: fechaStr,
                feriado: false,
                extra: false,
                horaent: '',
                horasal: ''
            });
        }

        return fechas;
    };

    // Función para aplicar feriados a los detalles de funcionarios
    const aplicarFeriados = (funcionarios, listaferiados) => {
        return funcionarios.map(funcionario => ({
            ...funcionario,
            detalles: funcionario.detalles ? funcionario.detalles.map(detalle => ({
                ...detalle,
                feriado: listaferiados.includes(detalle.fecha)
            })) : []
        }));
    };

    // Actualizar detalles cuando cambien las fechas
    const handleFechaChange = (event) => {
        const { name, value } = event.target;
        const nuevoData = { ...data, [name]: value };

        // Recalcular cantdias
        if (nuevoData.fechadesde && nuevoData.fechahasta) {
            nuevoData.cantdias = calcularDiasEnRango(nuevoData.fechadesde, nuevoData.fechahasta);

            // Actualizar detalles de funcionarios con nuevo rango
            const funcionariosActualizados = actualizarDetallesFuncionarios(
                nuevoData.fechadesde,
                nuevoData.fechahasta,
                data.listafuncionarios.map(f => ({ ...f, detalles: undefined })) // Remover detalles anteriores
            );

            // Aplicar feriados a los nuevos detalles
            nuevoData.listafuncionarios = aplicarFeriados(funcionariosActualizados, data.listaferiados);
        }

        setData(nuevoData);
    };

    // Función para actualizar los detalles de un funcionario
    const actualizarDetallesFuncionarios = (fechaDesde, fechaHasta, funcionarios) => {
        const fechasRango = generarFechasRango(fechaDesde, fechaHasta);

        return funcionarios.map(funcionario => ({
            ...funcionario,
            detalles: fechasRango.map(detalle => ({ ...detalle }))
        }));
    };

    // Función para agregar feriado
    const agregarFeriado = () => {
        if (!nuevaFechaFeriado) return;

        // Verificar que la fecha no esté ya en la lista
        if (data.listaferiados.includes(nuevaFechaFeriado)) {
            return;
        }

        const nuevaListaFeriados = [...data.listaferiados, nuevaFechaFeriado];

        // Actualizar el estado con la nueva lista de feriados
        const funcionariosActualizados = aplicarFeriados(data.listafuncionarios, nuevaListaFeriados);

        setData(prevData => ({
            ...prevData,
            listaferiados: nuevaListaFeriados,
            listafuncionarios: funcionariosActualizados
        }));

        setNuevaFechaFeriado('');
    };

    // Función para eliminar feriado
    const eliminarFeriado = (fechaFeriado) => {
        const nuevaListaFeriados = data.listaferiados.filter(fecha => fecha !== fechaFeriado);

        // Actualizar funcionarios removiendo el feriado
        const funcionariosActualizados = aplicarFeriados(data.listafuncionarios, nuevaListaFeriados);

        setData(prevData => ({
            ...prevData,
            listaferiados: nuevaListaFeriados,
            listafuncionarios: funcionariosActualizados
        }));
    };

    const recuperarFuncionarios = async () => {
        const response = await getFuncionario();
        const fechasDelMes = obtenerFechasDelMes();

        // Agregar detalles a cada funcionario
        const funcionariosConDetalles = actualizarDetallesFuncionarios(
            fechasDelMes.fechadesde,
            fechasDelMes.fechahasta,
            response
        );

        setData({
            fechadesde: fechasDelMes.fechadesde,
            fechahasta: fechasDelMes.fechahasta,
            cantdias: fechasDelMes.cantdias,
            listafuncionarios: funcionariosConDetalles,
            listaferiados: []
        });
    }

    useEffect(() => {
        recuperarFuncionarios();
    }, []);

    // Función para actualizar un detalle específico de un funcionario
    const actualizarDetalleFuncionario = (funcionarioId, fechaIndex, campo, valor) => {
        setData(prevData => ({
            ...prevData,
            listafuncionarios: prevData.listafuncionarios.map(funcionario => {
                if (funcionario.id === funcionarioId) {
                    const nuevosDetalles = [...funcionario.detalles];
                    nuevosDetalles[fechaIndex] = {
                        ...nuevosDetalles[fechaIndex],
                        [campo]: valor
                    };
                    return {
                        ...funcionario,
                        detalles: nuevosDetalles
                    };
                }
                return funcionario;
            })
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        let sw = 0;
        if (!data.fechadesde) {
            sw = 1
        }
        if (!data.fechahasta) {
            sw = 1
        }
        if (data.fechadesde > data.fechahasta) {
            sw = 1
        }

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            generarExcel(data);
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
                            <p className='container m-0 p-0'>CÁLCULOS</p>
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
                                <i className="bi bi-table me-2 text-black"></i>Cálculos
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Informe
                            </li>
                        </ol>
                    </nav>
                    <div className="colorSecundario p-0 m-0 border mt-3">
                        <p className="border-bottom border-2 border-black pb-2 pt-2 m-0 ps-3 text-start user-select-none h5">
                            <i className="bi bi-clipboard-data me-2 fs-5"></i>Realizar Informe de Horas Extras
                        </p>
                        <form
                            action="url.ph"
                            onSubmit={handleSubmit}
                            className="needs-validation"
                            noValidate
                        >
                            <div className="p-3 pt-5 pb-5 fw-semibold text-start">
                                <div className="input-group mb-5">
                                    <label className="form-label m-0">Fecha desde-hasta</label>
                                    <input
                                        type="date"
                                        id="fechadesde"
                                        name="fechadesde"
                                        className="ms-2 form-control border-input"
                                        value={data.fechadesde}
                                        onChange={handleFechaChange}
                                        required
                                    />
                                    <input
                                        type="date"
                                        id="fechahasta"
                                        name="fechahasta"
                                        className="ms-2 form-control border-input"
                                        value={data.fechahasta}
                                        onChange={handleFechaChange}
                                        required
                                    />
                                </div>

                                {/* Sección de carga de CSV */}
                                <div className="mb-5 border rounded-3 border-2 border-black p-3 bg-primary text-black">
                                    <h6 className="mb-3">
                                        <i className="bi bi-file-earmark-spreadsheet me-2"></i>Cargar Asistencias desde CSV
                                    </h6>
                                    <div className="input-group mb-3">
                                        <input
                                            type="file"
                                            className="form-control border-input mw-100"
                                            accept=".csv"
                                            onChange={handleCSVUpload}
                                            id="csvFile"
                                        />
                                    </div>
                                    {csvStatus && (
                                        <div className={`alert ${csvStatus.includes('✅') ? 'alert-success' : csvStatus.includes('⚠️') ? 'alert-warning' : 'alert-danger'} p-2 m-0 text-black`}>
                                            <small>{csvStatus}</small>
                                        </div>
                                    )}
                                </div>

                                {/* Sección de gestión de feriados */}
                                <div className="mb-5 border rounded-3 border-2 border-black p-3 bg-primary text-black">
                                    <h6 className="mb-3">
                                        <i className="bi bi-calendar-event me-2"></i>Gestión de Feriados
                                    </h6>
                                    {/* Campo para agregar nuevos feriados */}
                                    <div className="input-group mb-3 z-0">
                                        <input
                                            type="date"
                                            className="form-control border-input"
                                            value={nuevaFechaFeriado}
                                            onChange={(e) => setNuevaFechaFeriado(e.target.value)}
                                            style={{ maxWidth: '200px' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-success m-0"
                                            onClick={agregarFeriado}
                                            disabled={!nuevaFechaFeriado}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>Agregar
                                        </button>
                                    </div>
                                    {/* Lista de feriados */}
                                    {data.listaferiados.length > 0 && (
                                        <div className='alert alert-danger p-2 m-0 rounded-2 d-flex align-items-center justify-content-center text-center'>
                                            <div className="d-flex flex-wrap gap-2 justify-content-center">
                                                {data.listaferiados.map((fechaFeriado, index) => (
                                                    <div key={index} className="badge bg-danger fs-6 d-flex align-items-center">
                                                        <span className="me-2">{formatearFecha(fechaFeriado)}</span>
                                                        <button
                                                            type="button"
                                                            className="btn-close btn-close-white"
                                                            aria-label="Eliminar feriado"
                                                            onClick={() => eliminarFeriado(fechaFeriado)}
                                                            style={{ fontSize: '0.7em' }}
                                                        ></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {data.listafuncionarios && data.listafuncionarios.sort((a, b) => a.id - b.id).map((fc) => (
                                    <div key={fc.id} className='w-100 border border-1 border-black'>
                                        <button onClick={() => toggleContent(fc.id)} className="btn btn-primary z-0 rounded-0 w-100 text-black" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${fc.id}`} aria-expanded="false" aria-controls={`collapse-${fc.id}`}>
                                            <p className='float-start text-start m-0 fw-bold'>{fc.nombre} {fc.apellido}</p>
                                            <i className={`bi ${isOpen[fc.id] ? 'bi-arrow-up-circle-fill text-dark' : 'bi-arrow-down-circle-fill'} float-end fs-5`} ></i>
                                        </button>
                                        <table className="collapse table table-bordered table-striped table-sm table-hover m-0 border-black" id={`collapse-${fc.id}`}>
                                            <thead className='table-dark border-black'>
                                                <tr className='text-center align-middle'>
                                                    <th>Fecha</th>
                                                    <th>Hora Entrada</th>
                                                    <th>Hora Salida</th>
                                                    <th>Feriado</th>
                                                    <th>Extra Salida</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fc.detalles && fc.detalles.map((detalle, fechaIndex) => (
                                                    <tr key={`${fc.id}-${fechaIndex}`} className='text-center align-middle fw-normal'>
                                                        <td>{formatearFecha(detalle.fecha)}</td>
                                                        <td style={{ width: '300px' }}>
                                                            <input
                                                                type="time"
                                                                className="form-control border-input w-100"
                                                                value={detalle.horaent || '00:00'}
                                                                onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'horaent', e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td style={{ width: '300px' }}>
                                                            <input
                                                                type="time"
                                                                className="form-control border-input w-100"
                                                                value={detalle.horasal || '00:00'}
                                                                onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'horasal', e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td style={{ width: '120px' }}>
                                                            <input
                                                                type="checkbox"
                                                                className='form-check-input border-black'
                                                                checked={detalle.feriado}
                                                                onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'feriado', e.target.checked)}
                                                            />
                                                        </td>
                                                        <td style={{ width: '120px' }}>
                                                            <input
                                                                type="checkbox"
                                                                className='form-check-input border-black'
                                                                checked={detalle.extra}
                                                                onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'extra', e.target.checked)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                            <div className="border-top border-2 border-black pt-2 pb-2 ps-3 m-0 text-start user-select-none">
                                <button type='submit' className="btn btn-primary fw-bold px-3 text-black">
                                    <i className="bi bi-printer-fill me-2"></i>Generar
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