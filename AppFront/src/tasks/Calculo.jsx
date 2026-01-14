import { useState, useEffect, useRef } from 'react';
import { getEntity } from '../services/entidad.service';
import { getBranch } from '../services/sucursal.service';
import { getShift } from '../services/turno.service';
import { generarExcel } from './ArchivoExcel';
import Header from '../Header';

export const Calculo = ({ userLog }) => {

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
    const [sucursales, setSucursales] = useState([]);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const sigLinea = useRef({});
    const [selectedFuncionarios, setSelectedFuncionarios] = useState([]);

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

    const obtenerDiaSemana = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha + 'T00:00:00Z');
        const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        return days[date.getDay()];
    };

    const asignarDiaFondo = (fecha) => {
        const dia = obtenerDiaSemana(fecha);
        const claseFondo = dia === 'domingo' ? 'bg-danger-subtle' : '';
        return claseFondo;
    }

    function minutosAFormatoHora(minutosTotales) {
        const horas = Math.floor(minutosTotales / 60);
        const minutos = minutosTotales % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }

    function restarHoras(horaInicio, horaFin) {
        // Validar formato y valores
        if (!horaInicio || !horaFin || horaInicio.length < 4 || horaFin.length < 4) return '00:00';
        if ((horaInicio == '00:00' && horaFin == '00:00') || horaInicio == horaFin) return '00:00';
        const partesInicio = horaInicio.split(":");
        const partesFin = horaFin.split(":");
        if (partesInicio.length < 2 || partesFin.length < 2) return '00:00';
        const h1 = Number(partesInicio[0]);
        const m1 = Number(partesInicio[1]);
        const h2 = Number(partesFin[0]);
        const m2 = Number(partesFin[1]);
        if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '00:00';

        const minutosInicio = h1 * 60 + m1;
        let minutosFin = h2 * 60 + m2;

        // Si la hora de salida es menor o igual a la de entrada, asumimos que es al día siguiente
        if (minutosFin <= minutosInicio) {
            minutosFin += 24 * 60; // sumar 24 horas
        }

        const diferenciaMinutos = minutosFin - minutosInicio;
        return minutosAFormatoHora(diferenciaMinutos);
    }

    // Función para calcular horas trabajadas en decimal
    const calcularHorasTrabajadasDecimal = (horaEntrada, horaSalida, descanso) => {
        //if (horaEntrada == '00:00' || horaSalida == '00:00') return 0;

        const [h1, m1] = horaEntrada.split(":").map(Number);
        const [h2, m2] = horaSalida.split(":").map(Number);
        const [hd, md] = descanso.split(":").map(Number);

        const minutosEntrada = h1 * 60 + m1;
        let minutosSalida = h2 * 60 + m2;
        const minutosDescanso = hd * 60 + md;

        // Manejar turnos nocturnos
        if (minutosSalida <= minutosEntrada) {
            minutosSalida += 24 * 60;
        }

        const minutosTrabajados = minutosSalida - minutosEntrada - minutosDescanso;
        return Math.max(0, (minutosTrabajados / 60));
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
        let htot = '';
        let des = '';
        let tot = 0;
        let diaSemana = '';
        let cmp = [];
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

            if (funcionarioActual && campos[0] != 'Entrada') {
                cmp = cmp.concat(campos);
                continue;
            } else if (funcionarioActual) {
                for (let j = 0; j < cmp.length; j++) {
                    const str = cmp[j];
                    let tipo = '';
                    if (str != 'Entrada' && str != 'Salida') {
                        const fechaHora = cmp[j];
                        tipo = cmp[j + 1];
                        if (fechaHora) {
                            const parsedDateTime = parsearFechaCSV(fechaHora);
                            // console.log(parsedDateTime);
                            if (parsedDateTime) {
                                index = calcularDiasEnRango(dsd, parsedDateTime.fecha) - 1;
                                if (tipo == 'Entrada' && fechaEntrada != parsedDateTime.fecha) {
                                    if (!horaSalida && fechaEntrada != parsedDateTime.fecha) {
                                        horaSalida = obtenerHoraSalidaPorDefecto(horaEntrada);
                                        diaSemana = obtenerDiaSemana(fechaEntrada);
                                        trn = determinarTurno(horaEntrada, horaSalida);
                                        des = asignarDescanso(trn, diaSemana);
                                        htot = restarHoras(horaEntrada, horaSalida);
                                        tot = Number(calcularHorasTrabajadasDecimal(horaEntrada, horaSalida, des).toFixed(2));
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'turno', trn);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'horasal', horaSalida);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'htotal', htot);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'horades', des);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'total', tot);
                                        determinarHoras(trn, funcionarioActual.id, index - 1, tot);
                                    }
                                    fechaEntrada = parsedDateTime.fecha;
                                    horaEntrada = parsedDateTime.hora;
                                    actualizarDetalleFuncionario(funcionarioActual.id, index, 'horaent', horaEntrada);
                                    horaSalida = '';
                                } else {
                                    horaSalida = parsedDateTime.hora;
                                    diaSemana = obtenerDiaSemana(fechaEntrada);
                                    trn = determinarTurno(horaEntrada, horaSalida);
                                    des = asignarDescanso(trn, diaSemana);
                                    htot = restarHoras(horaEntrada, horaSalida);
                                    tot = Number(calcularHorasTrabajadasDecimal(horaEntrada, horaSalida, des).toFixed(2));
                                    if (fechaEntrada != parsedDateTime.fecha) {
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'turno', trn);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'horasal', horaSalida);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'htotal', htot);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'horades', des);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index - 1, 'total', tot);
                                        determinarHoras(trn, funcionarioActual.id, index - 1, tot);
                                    } else {
                                        actualizarDetalleFuncionario(funcionarioActual.id, index, 'turno', trn);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index, 'horasal', horaSalida);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index, 'htotal', htot);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index, 'horades', des);
                                        actualizarDetalleFuncionario(funcionarioActual.id, index, 'total', tot);
                                        determinarHoras(trn, funcionarioActual.id, index, tot);
                                    }
                                }
                            }
                        }
                    }
                }
                funcionarioActual = null;
                fechaEntrada = '';
                horaEntrada = '';
                horaSalida = '';
                cmp = [];
                continue;
            }
        }
    }

    // Función para asignar hora de salida por defecto según hora de entrada
    const obtenerHoraSalidaPorDefecto = (horaEntrada) => {
        if (horaEntrada == '00:00') return '00:00';
        const [h, m] = horaEntrada.split(':').map(Number);
        const minutos = h * 60 + m;
        if (minutos >= 330 && minutos < 870) return '14:30'; // 06:00 - 14:30
        if (minutos >= 420 && minutos < 1020) return '17:00'; // 07:00 - 17:00
        if (minutos >= 1380 || minutos < 390) return '06:30'; // 23:00 - 06:30
        if (minutos >= 840 && minutos < 1380) return '23:30'; // 14:00 - 23:30
        return '00:00';
    };

    // Función para fijar hora de entrada automáticamente según turno
    const fijarHoraEntrada = (id, idx, trn, sal, dia) => {
        if (!trn) return;
        let he = '00:00';
        if (trn == 'A') he = '06:00';
        else if (trn == 'B') he = '14:00';
        else if (trn == 'C') he = '23:00';
        else if (trn == 'D') he = '07:00';

        actualizarDetalleFuncionario(id, idx, 'horaent', he);
        const htot = restarHoras(he, sal);
        const des = asignarDescanso(trn, dia);
        const tot = Number(calcularHorasTrabajadasDecimal(he, sal, des).toFixed(2));
        actualizarDetalleFuncionario(id, idx, 'htotal', htot);
        actualizarDetalleFuncionario(id, idx, 'total', tot);
        actualizarDetalleFuncionario(id, idx, 'horades', des);
    }

    const limpiarHoras = (id, idx) => {
        let regHora = ['hn', 'hnn', 'hnmd', 'hnmn', 'hen', 'hent', 'hextras'];
        regHora.forEach(campo => actualizarDetalleFuncionario(id, idx, campo, 0));
    }

    // Función para determinar las horas según el turno
    const determinarHoras = (trn, id, idx, tot) => {
        limpiarHoras(id, idx);
        let horasn = 0, horasnn = 0, horasnmd = 0, horasnmn = 0;
        actualizarDetalleFuncionario(id, idx, 'hextras', 0);
        if (['A', 'D'].includes(trn)) {
            horasn = 8.00;
            actualizarDetalleFuncionario(id, idx, 'hn', Number(horasn.toFixed(2)));
        } else if (trn == 'C') {
            horasnn = 7.00;
            actualizarDetalleFuncionario(id, idx, 'hnn', Number(horasnn.toFixed(2)));
        } else if (trn == 'B') {
            horasnmd = 7.50;
            actualizarDetalleFuncionario(id, idx, 'hnmd', Number(horasnmd.toFixed(2)));
        } else if (trn == 'E') {
            horasnmn = 7.50;
            actualizarDetalleFuncionario(id, idx, 'hnmn', Number(horasnmn.toFixed(2)));
        }
        if (['A', 'D', 'B'].includes(trn)) actualizarDetalleFuncionario(id, idx, 'hen', Number((tot - (horasn + horasnmd)).toFixed(2)));
        else if (['C', 'E'].includes(trn)) actualizarDetalleFuncionario(id, idx, 'hent', Number((tot - (horasnn + horasnmn)).toFixed(2)));
    }

    // Función para asignar el descanso según el turno
    const asignarDescanso = (trn, dia) => {
        if (!trn || dia == 'sábado') return '00:00';

        // Buscar el turno en la lista para obtener el tiempo de descanso
        const turnoEncontrado = turnos.find(turno => turno.descripcion.split(' ')[1] == trn);
        let horaDescanso = '00:00';
        if (turnoEncontrado) horaDescanso = turnoEncontrado.horades.substring(0, 5);

        return horaDescanso;
    }

    // Función para determinar el turno basado en horarios de entrada y salida
    const determinarTurno = (entrada, salida) => {
        if (entrada == '00:00' || salida == '00:00') return '';

        // Convertir las horas a minutos para facilitar las comparaciones
        const convertirAMinutos = (hora) => {
            const partes = hora.split(':');
            const horas = parseInt(partes[0]);
            const minutos = parseInt(partes[1]);
            return horas * 60 + minutos;
        };

        const entradaMinutos = convertirAMinutos(entrada);
        const salidaMinutos = convertirAMinutos(salida);

        let mejorCoincidencia = null;
        let menorDiferencia = Infinity;

        // Tolerancia en minutos para entrada y salida
        const toleranciaEntrada = 60; // 1 hora
        const toleranciaSalida = 60;   // 1 hora

        for (const turno of turnos) {
            const entradaTurnoMinutos = convertirAMinutos(turno.horaent);
            const salidaTurnoMinutos = convertirAMinutos(turno.horasal);

            // Calcular diferencias
            let diferenciaEntrada = Math.abs(entradaMinutos - entradaTurnoMinutos);
            let diferenciaSalida = Math.abs(salidaMinutos - salidaTurnoMinutos);

            // Para turnos nocturnos, considerar el cruce de medianoche
            if (turno.tipoturno.tipo === 'Nocturno') {
                // Si el turno nocturno cruza medianoche
                if (salidaTurnoMinutos < entradaTurnoMinutos) {
                    // Ajustar la comparación para turnos nocturnos
                    if (salidaMinutos < entradaMinutos) {
                        // Ambos cruzan medianoche, comparación directa
                        diferenciaSalida = Math.abs(salidaMinutos - salidaTurnoMinutos);
                    } else {
                        // Solo el turno teórico cruza medianoche
                        const salidaAjustada = salidaMinutos + 1440;
                        const salidaTurnoAjustada = salidaTurnoMinutos + 1440;
                        diferenciaSalida = Math.abs(salidaAjustada - salidaTurnoAjustada);
                    }
                }
            }

            // Verificar si está dentro de las tolerancias
            const dentroToleranciaEntrada = diferenciaEntrada <= toleranciaEntrada;
            const dentroToleranciaSalida = diferenciaSalida <= toleranciaSalida;

            // Calcular diferencia total
            const diferenciaTotal = diferenciaEntrada + diferenciaSalida;

            // Verificar si es una buena coincidencia
            if (dentroToleranciaEntrada && dentroToleranciaSalida) {
                if (diferenciaTotal < menorDiferencia) {
                    menorDiferencia = diferenciaTotal;
                    mejorCoincidencia = turno;
                }
            }
        }

        // Si encontramos una coincidencia, retornar la letra del turno
        if (mejorCoincidencia) {
            return mejorCoincidencia.descripcion.split(' ')[1];
        }

        // Si no hay coincidencia exacta, intentar con lógica más flexible
        // Buscar el turno con menor diferencia total (incluso fuera de tolerancia)
        let turnoMasCercano = null;
        let menorDiferenciaTotal = Infinity;

        for (const turno of turnos) {
            const entradaTurnoMinutos = convertirAMinutos(turno.horaent);
            const salidaTurnoMinutos = convertirAMinutos(turno.horasal);

            let diferenciaEntrada = Math.abs(entradaMinutos - entradaTurnoMinutos);
            let diferenciaSalida = Math.abs(salidaMinutos - salidaTurnoMinutos);

            // Ajustar para turnos nocturnos
            if (turno.tipoturno.tipo === 'Nocturno' && salidaTurnoMinutos < entradaTurnoMinutos) {
                if (salidaMinutos < entradaMinutos) {
                    diferenciaSalida = Math.abs(salidaMinutos - salidaTurnoMinutos);
                } else {
                    const salidaAjustada = salidaMinutos + 1440;
                    const salidaTurnoAjustada = salidaTurnoMinutos + 1440;
                    diferenciaSalida = Math.abs(salidaAjustada - salidaTurnoAjustada);
                }
            }

            const diferenciaTotal = diferenciaEntrada + diferenciaSalida;

            if (diferenciaTotal < menorDiferenciaTotal) {
                menorDiferenciaTotal = diferenciaTotal;
                turnoMasCercano = turno;
            }
        }

        // Retornar el turno más cercano si existe
        if (turnoMasCercano) return turnoMasCercano.descripcion.split(' ')[1];
        return '';
    };

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
                dia: obtenerDiaSemana(fechaStr),
                fecha: fechaStr,
                horaent: '00:00',
                horasal: '00:00',
                htotal: '00:00',
                horades: '00:00',
                total: 0,
                hn: 0,
                hnn: 0,
                hnmd: 0,
                hnmn: 0,
                hen: 0,
                hent: 0,
                hextras: 0,
                feriado: false,
                extra: false,
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
        let funcionariosActualizados = aplicarFeriados(data.listafuncionarios, nuevaListaFeriados);

        // Aplica limpiarHoras y hextras para todos los funcionarios en la fecha feriada
        funcionariosActualizados = funcionariosActualizados.map(funcionario => ({
            ...funcionario,
            detalles: funcionario.detalles.map((detalle, fechaIndex) => {
                if (detalle.fecha === nuevaFechaFeriado) {
                    limpiarHoras(funcionario.id, fechaIndex);
                    return {
                        ...detalle,
                        hn: 0,
                        hnn: 0,
                        hnmd: 0,
                        hnmn: 0,
                        hen: 0,
                        hent: 0,
                        hextras: detalle.total
                    };
                }
                return detalle;
            })
        }));

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

        // Actualizar funcionarios removiendo el feriado y recalculando horas
        let funcionariosActualizados = aplicarFeriados(data.listafuncionarios, nuevaListaFeriados);

        funcionariosActualizados = funcionariosActualizados.map(funcionario => ({
            ...funcionario,
            detalles: funcionario.detalles.map((detalle) => {
                if (detalle.fecha === fechaFeriado) {
                    // Replicar la lógica de determinarHoras
                    let hn = 0, hnn = 0, hnmd = 0, hnmn = 0, hen = 0, hent = 0, hextras = 0;
                    const trn = detalle.turno;
                    const tot = detalle.total;
                    if (["A", "D"].includes(trn)) {
                        hn = 8.00;
                    } else if (trn === "C") {
                        hnn = 7.00;
                    } else if (trn === "B") {
                        hnmd = 7.50;
                    } else if (trn === "E") {
                        hnmn = 7.50;
                    }
                    if (["A", "D", "B"].includes(trn)) {
                        hen = Number((tot - (hn + hnmd)).toFixed(2));
                    } else if (["C", "E"].includes(trn)) {
                        hent = Number((tot - (hnn + hnmn)).toFixed(2));
                    }
                    // hextras debe quedar en 0
                    return {
                        ...detalle,
                        hn,
                        hnn,
                        hnmd,
                        hnmn,
                        hen,
                        hent,
                        hextras
                    };
                }
                return detalle;
            })
        }));

        setData(prevData => ({
            ...prevData,
            listaferiados: nuevaListaFeriados,
            listafuncionarios: funcionariosActualizados
        }));
    };

    const recuperarSucursales = async () => {
        const response = await getBranch();
        setSucursales(response.items);
    }

    const recuperarFuncionarios = async () => {
        const suc = selectedSucursal ? `;sucursal.id:eq:${selectedSucursal.id}` : '';
        const response = await getEntity('', '', '', `categorias:contains:Funcionario;estado:eq:Activo;horaextra:eq:true${suc}`);
        setFuncionarios(response.items);
        const fechasDelMes = obtenerFechasDelMes();

        // Agregar detalles a cada funcionario
        const funcionariosConDetalles = actualizarDetallesFuncionarios(
            fechasDelMes.fechadesde,
            fechasDelMes.fechahasta,
            response.items
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
        const response = await getShift();
        setTurnos(response.items);
    }

    useEffect(() => {
        recuperarFuncionarios();
    }, [selectedSucursal]);

    useEffect(() => {
        recuperarFuncionarios();
        recuperarSucursales();
        recuperarTurnos();
    }, []);

    // Función para actualizar un detalle específico de un funcionario
    const actualizarDetalleFuncionario = (funcionarioId, fechaIndex, campo, valor) => {
        setData(prevData => ({
            ...prevData,
            listafuncionarios: prevData.listafuncionarios.map(funcionario => {
                if (funcionario.id == funcionarioId) {
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

    // Navegación robusta entre filas de la tabla
    const handleSiguienteReg = (e, funcionarioId, fechaIndex) => {
        const key = e.key.toLowerCase();
        if (!sigLinea.current[funcionarioId]) return;
        if (key === 'z') {
            e.preventDefault();
            const nextRef = sigLinea.current[funcionarioId][fechaIndex + 1];
            if (nextRef) nextRef.focus();
        } else if (key === 'x') {
            e.preventDefault();
            const prevRef = sigLinea.current[funcionarioId][fechaIndex - 1];
            if (prevRef) prevRef.focus();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        const funcionariosFiltrados = data.listafuncionarios.filter(f =>
            selectedFuncionarios.includes(f.id)
        );

        const dataFiltrada = { ...data, listafuncionarios: funcionariosFiltrados };

        let sw = 0;
        if (!data.fechadesde || !data.fechahasta || data.fechadesde > data.fechahasta) sw = 1;

        if (sw == 1) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (form.checkValidity()) {
            if (dataFiltrada.listafuncionarios.length) generarExcel(dataFiltrada);
            form.classList.remove('was-validated');
        } else form.classList.add('was-validated');
    }

    const handleSelectFuncionario = (id) => {
        setSelectedFuncionarios(prev => {
            if (prev.includes(id)) return prev.filter(f => f !== id);
            return [...prev, id];
        });
    };

    return (
        <>
            <div className="modern-container colorPrimario">
                <Header userLog={userLog} title={'HORAS EXTRAS'} onToggleSidebar={null} on={0} icon={'chevron-double-left'} />
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
                                Realizar reporte de horas extras
                            </p>
                        </div>
                        <form
                            action="url.ph"
                            onSubmit={handleSubmit}
                            className="needs-validation"
                            noValidate
                        >
                            <div className="form-body">
                                <div className="modern-input-group">
                                    <label className="modern-label">
                                        <i className="bi bi-calendar me-2"></i>Fecha desde-hasta
                                    </label>
                                    <input
                                        type="date"
                                        id="fechadesde"
                                        name="fechadesde"
                                        className="modern-input mb-3"
                                        value={data.fechadesde}
                                        onChange={handleFechaChange}
                                    />
                                    <input
                                        type="date"
                                        id="fechahasta"
                                        name="fechahasta"
                                        className="modern-input"
                                        value={data.fechahasta}
                                        onChange={handleFechaChange}
                                    />
                                </div>

                                {/* Sección de gestión de feriados */}
                                <div className="modern-input-group">
                                    <label className="modern-label">
                                        <i className="bi bi-calendar-day me-2"></i>Gestión de Feriados
                                    </label>
                                    {/* Campo para agregar nuevos feriados */}
                                    <div className="input-group mb-3 z-0">
                                        <input
                                            type="date"
                                            className="modern-input form-control mw-100"
                                            value={nuevaFechaFeriado}
                                            onChange={(e) => setNuevaFechaFeriado(e.target.value)}
                                            style={{ maxWidth: '200px' }}
                                        />
                                        <button
                                            type="button"
                                            className="modern-button btn-primary"
                                            onClick={agregarFeriado}
                                            disabled={!nuevaFechaFeriado}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
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

                                {/* Sección de carga de CSV */}
                                <div className="modern-input-group">
                                    <label className="modern-label">
                                        <i className="bi bi-file-earmark-spreadsheet me-2"></i>Cargar Asistencias desde CSV
                                    </label>
                                    <div className="input-group mb-3 z-0">
                                        <input
                                            type="file"
                                            className="modern-input form-control mw-100"
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

                                {/* Sección de selección de sucursal */}
                                <div className="modern-input-group">
                                    <label className="modern-label">
                                        <i className="bi bi-building me-2"></i>Seleccionar Sucursal
                                    </label>
                                    <div className="dropdown mb-3">
                                        <button
                                            className="modern-button btn-primary dropdown-toggle w-100 justify-content-center"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                        >
                                            {selectedSucursal
                                                ? selectedSucursal.sucursal
                                                : "Todas las sucursales"
                                            }
                                        </button>
                                        <ul className="dropdown-menu p-2 w-100 border-2 border-black" style={{ maxHeight: '300px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                                            {/* Opción para todas las sucursales */}
                                            <li>
                                                <button
                                                    className={`dropdown-item ${!selectedSucursal ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedSucursal(null);
                                                        setSelectedFuncionarios([]);
                                                    }}
                                                >
                                                    <i className="bi bi-buildings me-2"></i>
                                                    Todas las sucursales
                                                </button>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>

                                            {/* Lista de sucursales */}
                                            {sucursales
                                                .filter(sucursal => !['000-GENERAL', '009-LOTEAMIENTO MBARACAYU'].includes(sucursal.sucursal))
                                                .map(sucursal => (
                                                    <li key={sucursal.id}>
                                                        <button
                                                            className={`dropdown-item ${selectedSucursal?.id === sucursal.id ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setSelectedSucursal(sucursal);
                                                                setSelectedFuncionarios([]);
                                                            }}
                                                        >
                                                            <i className="bi bi-building me-2"></i>
                                                            {sucursal.sucursal}
                                                        </button>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Sección de selección de funcionarios */}
                                <div className="modern-input-group">
                                    <label className="modern-label">
                                        <i className="bi bi-people me-2"></i>Seleccionar Funcionarios
                                    </label>
                                    <div className="dropdown mb-3">
                                        <button
                                            className="modern-button btn-primary dropdown-toggle w-100 justify-content-center"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                        >
                                            {selectedFuncionarios.length > 0
                                                ? `${selectedFuncionarios.length} Seleccionados`
                                                : "Lista de Funcionarios"}
                                        </button>
                                        <ul className="dropdown-menu p-2 w-100 border-2 border-black" style={{ maxHeight: '300px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                                            {/* Botón de seleccionar todo */}
                                            <li className="pb-2 border-bottom mb-2">
                                                <button
                                                    className="btn btn-success w-100 py-1"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (selectedFuncionarios.length === funcionarios.length) {
                                                            // desmarcar todo
                                                            setSelectedFuncionarios([]);
                                                        } else {
                                                            // seleccionar todos
                                                            setSelectedFuncionarios(funcionarios.map(f => f.id));
                                                        }
                                                    }}
                                                >
                                                    {selectedFuncionarios.length === funcionarios.length
                                                        ? "Desmarcar todos"
                                                        : "Seleccionar todos"
                                                    }
                                                </button>
                                            </li>

                                            {/* Lista de funcionarios */}
                                            {funcionarios.map(f => (
                                                <li key={f.id}>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            value={f.id}
                                                            id={`func-${f.id}`}
                                                            checked={selectedFuncionarios.includes(f.id)}
                                                            onChange={() => handleSelectFuncionario(f.id)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`func-${f.id}`}>
                                                            {f.nomape}
                                                        </label>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {selectedFuncionarios.length > 0 && data.listafuncionarios
                                    .filter(fc => selectedFuncionarios.includes(fc.id))
                                    .sort((a, b) => a.id - b.id)
                                    .map((fc) => (
                                        <div key={fc.id} className='w-100 border border-1 border-black'>
                                            <button onClick={() => toggleContent(fc.id)} className={`btn ${isOpen[fc.id] ? 'btn-success' : 'btn-warning'} z-0 rounded-0 w-100 text-black`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${fc.id}`} aria-expanded="false" aria-controls={`collapse-${fc.id}`}>
                                                <p className={`float-start text-start m-0 fw-bold`}>{fc.nombre} {fc.apellido}</p>
                                                <i className={`bi ${isOpen[fc.id] ? 'bi-arrow-up-circle-fill' : 'bi-arrow-down-circle-fill'} float-end fs-5`} ></i>
                                            </button>
                                            <table className="collapse table table-striped table-bordered table-sm table-hover m-0 border-black" id={`collapse-${fc.id}`}>
                                                <thead className='table-dark border-black'>
                                                    <tr className='text-center align-middle'>
                                                        <th rowSpan="2">Día</th>
                                                        <th rowSpan="2">Fecha</th>
                                                        <th colSpan="4">Horarios</th>
                                                        <th colSpan="8">Horas Extras</th>
                                                        <th colSpan="2">Estado</th>
                                                        <th rowSpan="2" hidden={![1].includes(userLog?.tipousuario?.id)}>Tr.</th>
                                                    </tr>
                                                    <tr className='text-center align-middle'>
                                                        {/* Subheaders para Horarios */}
                                                        <th>Ent.</th>
                                                        <th>Sal.</th>
                                                        <th>Tot.</th>
                                                        <th>Des.</th>
                                                        {/* Subheaders para Horas Extras */}
                                                        <th>T.</th>
                                                        <th>1</th>
                                                        <th>2</th>
                                                        <th>3</th>
                                                        <th>4</th>
                                                        <th>5</th>
                                                        <th>6</th>
                                                        <th>7</th>
                                                        {/* Subheaders para Estado */}
                                                        <th>Frd.</th>
                                                        <th>S.Ex.</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fc.detalles && fc.detalles.map((detalle, fechaIndex) => (
                                                        <tr key={`${fc.id}-${fechaIndex}`} className={`text-center align-middle fw-normal`}>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '80px', fontSize: '0.85rem' }}>
                                                                {detalle.dia}
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '90px', fontSize: '0.85rem' }}>
                                                                {formatearFecha(detalle.fecha)}
                                                            </td>

                                                            {/* Sección de Horarios */}
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '50px' }}>
                                                                <input
                                                                    type="time"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.horaent || '00:00'}
                                                                    onChange={(e) => {
                                                                        actualizarDetalleFuncionario(fc.id, fechaIndex, 'feriado', false);
                                                                        actualizarDetalleFuncionario(fc.id, fechaIndex, 'extra', false);
                                                                        actualizarDetalleFuncionario(fc.id, fechaIndex, 'horaent', e.target.value);
                                                                        const trn = determinarTurno(e.target.value, detalle.horasal);
                                                                        const htot = restarHoras(e.target.value, detalle.horasal);
                                                                        let des = '00:00';
                                                                        if (htot == '00:00') {
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'total', 0);
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'htotal', '00:00');
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'turno', '');
                                                                            limpiarHoras(fc.id, fechaIndex);
                                                                        } else {
                                                                            des = asignarDescanso(trn, detalle.dia);
                                                                            const tot = Number(calcularHorasTrabajadasDecimal(e.target.value, detalle.horasal, des).toFixed(2));
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'total', tot);
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'htotal', htot);
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'turno', trn);
                                                                            determinarHoras(trn, fc.id, fechaIndex, tot);
                                                                        }
                                                                        actualizarDetalleFuncionario(fc.id, fechaIndex, 'horades', des);
                                                                    }}
                                                                    ref={el => {
                                                                        if (!sigLinea.current[fc.id]) sigLinea.current[fc.id] = [];
                                                                        sigLinea.current[fc.id][fechaIndex] = el;
                                                                    }}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '50px' }}>
                                                                <input
                                                                    type="time"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.horasal || '00:00'}
                                                                    onChange={(e) => {
                                                                        actualizarDetalleFuncionario(fc.id, fechaIndex, 'feriado', false);
                                                                        actualizarDetalleFuncionario(fc.id, fechaIndex, 'extra', false);
                                                                        actualizarDetalleFuncionario(fc.id, fechaIndex, 'horasal', e.target.value);
                                                                        const trn = determinarTurno(detalle.horaent, e.target.value);
                                                                        const htot = restarHoras(detalle.horaent, e.target.value);
                                                                        let des = '00:00';
                                                                        if (htot == '00:00') {
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'total', 0);
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'htotal', '00:00');
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'turno', '');
                                                                            limpiarHoras(fc.id, fechaIndex);
                                                                        } else {
                                                                            des = asignarDescanso(trn, detalle.dia);
                                                                            const tot = Number(calcularHorasTrabajadasDecimal(detalle.horaent, e.target.value, des).toFixed(2));
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'total', tot);
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'htotal', htot);
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'turno', trn);
                                                                            determinarHoras(trn, fc.id, fechaIndex, tot);
                                                                        }
                                                                        actualizarDetalleFuncionario(fc.id, fechaIndex, 'horades', des);
                                                                    }}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '50px' }}>
                                                                <input
                                                                    type="time"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.htotal || '00:00'}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'htotal', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '50px' }}>
                                                                <input
                                                                    type="time"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.horades || '00:00'}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'horades', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>

                                                            {/* Sección de Horas Extras */}
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '70px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.total || 0}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'total', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '70px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.hn || 0}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'hn', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '70px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.hnn || 0}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'hnn', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '70px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.hnmd || 0}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'hnmd', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '70px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.hnmn || 0}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'hnmn', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '70px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.hen || 0}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'hen', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '70px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.hent || 0}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'hent', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '70px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control border-input w-100"
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.hextras || 0}
                                                                    onChange={(e) => actualizarDetalleFuncionario(fc.id, fechaIndex, 'hextras', e.target.value)}
                                                                    onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                />
                                                            </td>

                                                            {/* Sección de Estado */}
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '60px' }}>
                                                                <div className="d-flex justify-content-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        className='form-check-input border-black'
                                                                        style={{ transform: 'scale(1.2)' }}
                                                                        checked={detalle.feriado}
                                                                        onChange={(e) => {
                                                                            const checked = e.target.checked;
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'feriado', checked);
                                                                            if (checked) {
                                                                                limpiarHoras(fc.id, fechaIndex);
                                                                                actualizarDetalleFuncionario(fc.id, fechaIndex, 'hextras', detalle.total);
                                                                            } else determinarHoras(detalle.turno, fc.id, fechaIndex, detalle.total);
                                                                        }}
                                                                        onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`} style={{ width: '60px' }}>
                                                                <div className="d-flex justify-content-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        className='form-check-input border-black'
                                                                        style={{ transform: 'scale(1.2)' }}
                                                                        checked={detalle.extra}
                                                                        onChange={(e) => {
                                                                            const checked = e.target.checked;
                                                                            actualizarDetalleFuncionario(fc.id, fechaIndex, 'extra', checked);
                                                                            fijarHoraEntrada(fc.id, fechaIndex, detalle.turno, detalle.horasal, detalle.dia);
                                                                        }}
                                                                        onKeyDown={e => handleSiguienteReg(e, fc.id, fechaIndex)}
                                                                        disabled={detalle.extra}
                                                                    />
                                                                </div>
                                                            </td>

                                                            <td className={`${asignarDiaFondo(detalle.fecha)}`}
                                                                hidden={![1].includes(userLog?.tipousuario?.id)}
                                                                style={{ width: '60px' }}>
                                                                <input
                                                                    type="text"
                                                                    className='form-control border-black text-center'
                                                                    style={{ fontSize: '0.8rem' }}
                                                                    value={detalle.turno}
                                                                    readOnly
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                            </div>
                            <div className='div-report-button'>
                                <button type='submit' className="btn btn-primary border-0 btn-lg" disabled={selectedFuncionarios.length == 0}>
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

export default Calculo;
