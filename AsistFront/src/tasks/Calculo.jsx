import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getFuncionario } from '../services/funcionario.service';
import { generarExcel } from './ArchivoExcel';
import { getTurno } from '../services/turno.service';

export const Calculo = ({ usuarioUsed }) => {
    const UrlBase = '/asist';

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
    const [turnos, setTurnos] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);

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

    // Convertir a fecha
    const convertirFecha = (fecha) => {
        const [dia, mes, anio] = fecha.split('/');
        return `${anio}-${mes}-${dia}`;
    }

    // Función para parsear fecha del CSV (DD/MM/YYYY HH:MM)
    const parsearFechaCSV = (fechaHoraStr) => {
        if (!fechaHoraStr || fechaHoraStr.trim() === '') return null;

        try {
            // Formato esperado: "02/06/2025 05:53"
            const [fechaPart, horaPart] = fechaHoraStr.trim().split(' ');
            const [dia, mes, año] = fechaPart.split('/');

            return {
                fecha: `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`,
                hora: horaPart,
                idx: parseInt(dia)
            };
        } catch (error) {
            console.error('Error parseando fecha:', fechaHoraStr, error);
            return null;
        }
    };

    // Función para procesar el archivo CSV
    const procesarCSV = (csvText) => {
        const lineas = csvText.split('\n');
        let funcionarioActual = null;
        let dsd = '';
        let hst = '';
        let index = 0;
        let fechaEntrada = '';
        let horaEntrada = '';
        let horaSalida = '';
        let trn = '';
        // console.log(lineas);

        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;
            // console.log(linea);
            const campos = linea.split(';').filter(item => item != '');
            // console.log(campos);

            // Detectar fecha desde-hasta
            if (campos[0] == 'Desde' && campos[2] == 'Hasta') {
                dsd = convertirFecha(campos[1]);
                hst = convertirFecha(campos[3]);
                const funcionariosFechaNueva = actualizarDetallesFuncionarios(dsd, hst, funcionarios);

                // console.log(funcionariosFechaNueva);
                setData(prevData => ({
                    ...prevData,
                    fechadesde: dsd,
                    fechahasta: hst,
                    listafuncionarios: funcionariosFechaNueva,
                    cantdias: calcularDiasEnRango(dsd, hst)
                }));
            }

            // Detectar línea de funcionario (contiene ID y Nombre)
            if (campos[0] == 'ID') {
                const idx = parseInt(campos[1]);
                // console.log(idx);
                if (idx) funcionarioActual = funcionarios.find(f => idx == f.codigo);
                continue;
            }

            // Procesar líneas de registros de entrada/salida
            if (funcionarioActual) {
                // console.log(funcionarioActual);
                for (let j = 0; j < campos.length; j++) {
                    if (campos[0] != 'Entrada') {
                        const str = campos[j];
                        if (str != 'Entrada' && str != 'Salida') {
                            const fechaHora = campos[j];
                            const tipo = campos[j + 1];
                            if (fechaHora && (tipo == 'Entrada' || tipo == 'Salida')) {
                                const parsedDateTime = parsearFechaCSV(fechaHora);
                                // console.log(parsedDateTime);
                                if (parsedDateTime) {
                                    index = calcularDiasEnRango(dsd, parsedDateTime.fecha) - 1;
                                    if (tipo == 'Entrada' && fechaEntrada != parsedDateTime.fecha) {
                                        fechaEntrada = parsedDateTime.fecha;
                                        horaEntrada = parsedDateTime.hora;
                                        actualizarDetalleFuncionario(funcionarioActual.id, index, 'horaent', horaEntrada);
                                    } else if (tipo == 'Salida') {
                                        horaSalida = parsedDateTime.hora;
                                        trn = determinarTurno(horaEntrada, horaSalida);
                                        if (fechaEntrada != parsedDateTime.fecha) {
                                            actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'horasal', horaSalida);
                                            actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'turno', trn);
                                            asignarDescanso(funcionarioActual.id, index - 1, trn);
                                        } else {
                                            actualizarDetalleFuncionario(funcionarioActual.id, index, 'horasal', horaSalida);
                                            actualizarDetalleFuncionario(funcionarioActual.id, index, 'turno', trn);
                                            asignarDescanso(funcionarioActual.id, index, trn);
                                        }
                                        horaEntrada = '';
                                        horaSalida = '';
                                        trn = '';
                                    };
                                }
                            }
                        }
                    } else {
                        funcionarioActual = null;
                        fechaEntrada = '';
                        horaEntrada = '';
                        horaSalida = '';
                        trn = '';
                        continue;
                    }
                }
            }
        }
    };

    // Función para asignar el descanso según el turno
    const asignarDescanso = (idFuncionario, idx, trn) => {
        if (!trn) return;

        // Buscar el turno en la lista para obtener el tiempo de descanso
        const turnoEncontrado = turnos.find(turno => turno.descripcion.split(' ')[1] === trn);
        if (turnoEncontrado) {
            const horaDescanso = turnoEncontrado.horades.substring(0, 5);
            actualizarDetalleFuncionario(idFuncionario, idx, 'horades', horaDescanso);
        }
    }

    // Función para determinar el turno basado en horarios de entrada y salida
    const determinarTurno = (entrada, salida) => {
        if (!entrada || !salida || turnos.length == 0) return '';

        // Convertir las horas a minutos para facilitar las comparaciones
        const convertirAMinutos = (hora) => {
            // Manejar formato "HH:MM:SS" y "HH:MM"
            const partes = hora.split(':');
            const horas = parseInt(partes[0]);
            const minutos = parseInt(partes[1]);
            return horas * 60 + minutos;
        };

        const entradaMinutos = convertirAMinutos(entrada);
        const salidaMinutos = convertirAMinutos(salida);

        // Tolerancia en minutos para la comparación (30 minutos)
        const tolerancia = 30;

        // Función auxiliar para verificar si está dentro del rango con tolerancia
        const estaEnRango = (valor, objetivo, tolerancia) => {
            return Math.abs(valor - objetivo) <= tolerancia;
        };

        // Buscar el turno que mejor coincida
        let mejorCoincidencia = null;
        let menorDiferencia = Infinity;

        for (const turno of turnos) {
            const entradaTurnoMinutos = convertirAMinutos(turno.horaent);
            const salidaTurnoMinutos = convertirAMinutos(turno.horasal);

            let salidaComparar = salidaMinutos;
            let salidaTurnoComparar = salidaTurnoMinutos;

            // Manejo especial para turnos nocturnos (cuando la salida es menor que la entrada)
            if (turno.tipoturno.tipo === 'Nocturno' || salidaTurnoMinutos < entradaTurnoMinutos) {
                // Si es turno nocturno y la salida registrada es menor que la entrada,
                // significa que la salida es del día siguiente
                if (salidaMinutos < entradaMinutos) {
                    salidaComparar = salidaMinutos + 1440; // Agregar 24 horas
                }
                salidaTurnoComparar = salidaTurnoMinutos + 1440;
            }

            // Calcular diferencia total entre horarios
            const diferenciaEntrada = Math.abs(entradaMinutos - entradaTurnoMinutos);
            const diferenciaSalida = Math.abs(salidaComparar - salidaTurnoComparar);
            const diferenciaTotal = diferenciaEntrada + diferenciaSalida;

            // Verificar si está dentro de la tolerancia y es la mejor coincidencia
            if (estaEnRango(entradaMinutos, entradaTurnoMinutos, tolerancia) &&
                estaEnRango(salidaComparar, salidaTurnoComparar, tolerancia) &&
                diferenciaTotal < menorDiferencia) {

                menorDiferencia = diferenciaTotal;
                mejorCoincidencia = turno;
            }
        }

        // Si encontramos una coincidencia, retornar la descripción del turno
        if (mejorCoincidencia) {
            // Retornar solo la letra del turno (A, B, C, D)
            return mejorCoincidencia.descripcion.split(' ')[1]; // "Turno A" -> "A"
        }

        // Si no se encuentra coincidencia exacta, intentar lógica más flexible
        for (const turno of turnos) {
            const entradaTurnoMinutos = convertirAMinutos(turno.horaent);
            const salidaTurnoMinutos = convertirAMinutos(turno.horasal);

            // Lógica más flexible para turnos diurnos
            if (turno.tipoturno.tipo === 'Diurno') {
                if (entradaMinutos >= entradaTurnoMinutos - 60 &&
                    entradaMinutos <= entradaTurnoMinutos + 60 &&
                    salidaMinutos >= salidaTurnoMinutos - 60 &&
                    salidaMinutos <= salidaTurnoMinutos + 60) {
                    return turno.descripcion.split(' ')[1];
                }
            }

            // Lógica para turnos nocturnos
            if (turno.tipoturno.tipo === 'Nocturno') {
                let salidaComparar = salidaMinutos;
                if (salidaMinutos < entradaMinutos) {
                    salidaComparar = salidaMinutos + 1440;
                }

                if (entradaMinutos >= entradaTurnoMinutos - 60 &&
                    entradaMinutos <= entradaTurnoMinutos + 60 &&
                    salidaComparar >= (salidaTurnoMinutos + 1440) - 60 &&
                    salidaComparar <= (salidaTurnoMinutos + 1440) + 60) {
                    return turno.descripcion.split(' ')[1];
                }
            }

            // Lógica para turnos mixtos
            if (turno.tipoturno.tipo === 'Mixto Diurno') {
                if (entradaMinutos >= entradaTurnoMinutos - 60 &&
                    entradaMinutos <= entradaTurnoMinutos + 60 &&
                    salidaMinutos >= salidaTurnoMinutos - 60 &&
                    salidaMinutos <= salidaTurnoMinutos + 60) {
                    return turno.descripcion.split(' ')[1];
                }
            }
        }

        // Si no se puede determinar, retornar vacío
        return '';
    }

    // Función para limpiar el archivo CSV
    const limpiarCSV = () => {
        setCsvStatus('');
        // Limpiar el input file
        const fileInput = document.getElementById('csvFile');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // Función para manejar la carga del archivo CSV
    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        // console.log(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                // console.log(csvText);
                if (csvText) {
                    setCsvStatus(`✅ CSV procesado correctamente.`);
                    procesarCSV(csvText);
                } else setCsvStatus('⚠️ No se encontraron datos válidos en el archivo CSV.');
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
                horasal: '',
                horades: '',
                turno: ''
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
                // horaent: '00:00',
                // horasal: '00:00',
                // horades: '00:00'
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
        limpiarCSV();
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
        setFuncionarios(response);
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

    const recuperarTurnos = async () => {
        const response = await getTurno();
        setTurnos(response);
    }

    useEffect(() => {
        recuperarFuncionarios();
        recuperarTurnos();
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
        if (!data.fechadesde || !data.fechahasta || data.fechadesde > data.fechahasta) {
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
                            <p className='container m-0 p-0'>HORAS EXTRAS</p>
                        </div>
                        <div className='d-flex align-items-center ps-3'>
                            <i className='bi bi-person fs-3 me-3'></i>
                            <p className='m-0'>{usuarioUsed.tipousuario.tipousuario}</p>
                        </div>
                        <div className='d-flex align-items-center ms-auto'>
                            <img className="navbar-brand p-0 m-0 me-3" src="/logo2.svg" alt="Maria Mora Atelier" style={{ width: '120px', height: '40px' }} />
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
                                <i className="bi bi-file-earmark-text-fill me-2 text-black"></i>Reportes
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Horas Extras
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
                                <div className="input-group mb-5 z-0">
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
                                <div className="mb-5 border rounded-3 border-black p-3 bg-warning text-black">
                                    <h6 className="mb-3">
                                        <i className="bi bi-file-earmark-spreadsheet me-2"></i>Cargar Asistencias desde CSV
                                    </h6>
                                    <div className="input-group mb-3 z-0">
                                        <input
                                            type="file"
                                            className="form-control border-input mw-100"
                                            accept=".csv"
                                            onChange={handleCSVUpload}
                                            onClick={limpiarCSV}
                                            id="csvFile"
                                        />
                                    </div>
                                    {csvStatus && (
                                        <div className={`alert ${csvStatus.includes('✅') ? 'alert-success' : 'alert-danger'} p-2 m-0 text-black`}>
                                            <small>{csvStatus}</small>
                                        </div>
                                    )}
                                </div>

                                {/* Sección de gestión de feriados */}
                                <div className="mb-5 border rounded-3 border-black p-3 bg-warning text-black">
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
                                        <button onClick={() => toggleContent(fc.id)} className={`btn ${isOpen[fc.id] ? 'btn-success' : 'btn-warning'} z-0 rounded-0 w-100 text-black`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${fc.id}`} aria-expanded="false" aria-controls={`collapse-${fc.id}`}>
                                            <p className={`float-start text-start m-0 fw-bold`}>{fc.nombre} {fc.apellido}</p>
                                            <i className={`bi ${isOpen[fc.id] ? 'bi-arrow-up-circle-fill' : 'bi-arrow-down-circle-fill'} float-end fs-5`} ></i>
                                        </button>
                                        <table className="collapse table table-bordered table-striped table-sm table-hover m-0 border-black" id={`collapse-${fc.id}`}>
                                            <thead className='table-dark border-black'>
                                                <tr className='text-center align-middle'>
                                                    <th>Fecha</th>
                                                    <th>Hora Entrada</th>
                                                    <th>Hora Salida</th>
                                                    <th>Hora Descanso</th>
                                                    <th>Feriado</th>
                                                    <th>Extra Entrada</th>
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
                                                                onChange={(e) => {
                                                                    actualizarDetalleFuncionario(fc.id, fechaIndex, 'horaent', e.target.value);
                                                                    const trn = determinarTurno(e.target.value, detalle.horasal);
                                                                    asignarDescanso(fc.id, fechaIndex, trn);
                                                                }}
                                                                required
                                                            />
                                                        </td>
                                                        <td style={{ width: '300px' }}>
                                                            <input
                                                                type="time"
                                                                className="form-control border-input w-100"
                                                                value={detalle.horasal || '00:00'}
                                                                onChange={(e) => {
                                                                    actualizarDetalleFuncionario(fc.id, fechaIndex, 'horasal', e.target.value);
                                                                    const trn = determinarTurno(detalle.horaent, e.target.value);
                                                                    asignarDescanso(fc.id, fechaIndex, trn);
                                                                }}
                                                                required
                                                            />
                                                        </td>
                                                        <td style={{ width: '300px' }}>
                                                            <input
                                                                type="time"
                                                                className="form-control border-input w-100"
                                                                value={detalle.horades || '00:00'}
                                                                onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'horades', e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td style={{ width: '120px' }}>
                                                            <input
                                                                type="checkbox"
                                                                className='form-check-input border-black'
                                                                checked={detalle.feriado}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    actualizarDetalleFuncionario(fc.id, fechaIndex, 'feriado', checked);
                                                                    // if (checked) {
                                                                    //     actualizarDetalleFuncionario(fc.id, fechaIndex, 'horaent', '00:00');
                                                                    //     actualizarDetalleFuncionario(fc.id, fechaIndex, 'horasal', '00:00');
                                                                    //     actualizarDetalleFuncionario(fc.id, fechaIndex, 'horades', '00:00');
                                                                    // }
                                                                }}
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
                                <button type='submit' className="btn btn-success fw-bold px-3 text-black">
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
