import { read, writeFileXLSX, utils } from "xlsx";
import { LogoBase64 } from "../utils/LogoBase64";

const generarExcel = async (data) => {
    const { cantdias, fechadesde, fechahasta, listafuncionarios } = data;

    // Crear workbook
    const workbook = utils.book_new();

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha + 'T00:00:00Z');
        const day = String(date.getUTCDate()).padStart(2, '0'); // Agrega un cero si es necesario
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    // Función para obtener el día de la semana
    const obtenerDiaSemana = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha + 'T00:00:00Z');
        const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        return days[date.getDay()];
    };

    const capitalize = (text) => {
        return text
            .toLowerCase()
            .split(/[- ]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const firstChar = (text) => {
        const texts = text.trim().split(/\s+/);
        return capitalize(texts[0]);
    }

    // Función para formatear período
    const formatearPeriodo = () => {
        return `${formatearFecha(fechadesde)} AL ${formatearFecha(fechahasta)}`;
    };

    // Función para separador de miles
    const formatearNumero = (valor) => {
        if (!valor || isNaN(Number(valor))) {
            return valor; // Retorna lo mismo si está vacío o no es número válido
        }
        return Number(valor).toLocaleString("es-PY");
    };

    // Función para convertir minutos a formato HH:MM
    function minutosAFormatoHora(minutosTotales) {
        const horas = Math.floor(minutosTotales / 60);
        const minutos = minutosTotales % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }

    // Función para restar dos horas en formato HH:MM
    function restarHoras(horaInicio, horaFin) {
        const [h1, m1] = horaInicio.split(":").map(Number);
        const [h2, m2] = horaFin.split(":").map(Number);

        const minutosInicio = h1 * 60 + m1;
        const minutosFin = h2 * 60 + m2;

        const diferenciaMinutos = minutosFin - minutosInicio;
        return minutosAFormatoHora(diferenciaMinutos);
    }

    // Procesar cada funcionario
    listafuncionarios.forEach((funcionario, index) => {
        // Crear datos para la hoja del funcionario
        const datosHoja = [];

        // Fila 1: Título principal
        datosHoja.push(['', '', '', '', '', 'PLANILLA DE CONTROL - HORAS EXTRAS', '', '', '', '', '', '', '', '']);

        // Fila 2: Vacía
        datosHoja.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '']);

        // Fila 3: Información del funcionario
        const nombreCompleto = (`${funcionario.apellido}, ${funcionario.nombre}`).toUpperCase();
        datosHoja.push([
            'FUNCIONARIO:', nombreCompleto, '', '', '', 'CIN°:', formatearNumero(funcionario.nrodoc), '',
            'CARGO:', '', '', 'PERIODO:', formatearPeriodo(),
        ]);

        // Fila 4: Encabezados de tabla
        datosHoja.push([
            'DÍA', 'FECHA', 'ENTRADA', 'SALIDA', 'H. TOTAL', 'DESCANSO', 'TOTAL', 'H. NORMALES', 'H. NORM. NOCT.',
            'H. NORM. MD.', 'H. NORM. MN.', 'H. EXTRAS NORM.', 'H. EXTRAS NOCT.', 'H. EXTRAS 100%'
        ]);

        let totalt = 0;
        let totalhn = 0;
        let totalhnn = 0;
        let totalhnmd = 0;
        let totalhnmn = 0;
        let totalhen = 0;
        let totalhent = 0;
        let totalhextras = 0;
        let ind = 0;

        // Filas de datos diarios
        funcionario.detalles.forEach((detalle, diaIndex) => {
            const diaSemana = obtenerDiaSemana(detalle.fecha);
            const fechaFormateada = formatearFecha(detalle.fecha);

            // Calcular horas si hay entrada y salida
            let htotal = '00:00';
            let descanso = '00:00';
            let total = 0;
            let horasn = 0;
            let horasnn = 0;
            let horasnmd = 0;
            let horasnmn = 0;
            let horasen = 0;
            let horasent = 0;
            let horasextras = 0;

            if (detalle.horaent && detalle.horasal) {
                htotal = restarHoras(detalle.horaent, detalle.horasal);
                total = htotal - descanso;
            }

            totalt += total;
            totalhn += horasn;
            totalhnn += horasnn;
            totalhnmd += horasnmd;
            totalhnmn += horasnmn;
            totalhen += horasen;
            totalhent += horasent;
            totalhextras += horasextras;

            datosHoja.push([
                diaSemana,
                fechaFormateada,
                detalle.horaent || '00:00:00',
                detalle.horasal || '00:00:00',
                htotal,
                descanso,
                total || '-',
                horasn || '-',
                horasnn || '-',
                horasnmd || '-',
                horasnmn || '-',
                horasen || '-',
                horasent || '-',
                horasextras || '-'
            ]);
            ind += 1;
        });

        // Fila de totales
        datosHoja.push([
            'TOTAL HORAS', '', '', '', '', '', totalt, totalhn, totalhnn, totalhnmd, totalhnmn,
            totalhen, totalhent, totalhextras
        ]);

        // Crear worksheet
        const worksheet = utils.aoa_to_sheet(datosHoja);

        // Configurar anchos de columna
        worksheet['!cols'] = [
            { wch: 14 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 16 },
            { wch: 16 },
            { wch: 16 },
            { wch: 16 },
            { wch: 16 },
            { wch: 16 },
            { wch: 16 }
        ];

        // Configurar altura de filas para las fechas con días de semana
        const rowHeights = [];
        for (let i = 0; i < datosHoja.length; i++) {
            if (i >= 4 && i < 4 + cantdias) {
                rowHeights[i] = { hpt: 30 }; // Altura para acomodar día y fecha
            } else {
                rowHeights[i] = { hpt: 15 };
            }
        }
        worksheet['!rows'] = rowHeights;

        // Configurar merge cells para el título
        worksheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 1, c: 13 } }, // Titulo
            { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } }, // Funcionario
            { s: { r: 2, c: 9 }, e: { r: 2, c: 10 } }, // Cargo
            { s: { r: 2, c: 12 }, e: { r: 2, c: 13 } }, // Período
            { s: { r: ind + 4, c: 0 }, e: { r: ind + 4, c: 5 } } // Período
        ];

        // Aplicar estilos básicos usando propiedades de celda
        // Título principal
        if (!worksheet['F1']) worksheet['F1'] = {};
        worksheet['F1'].s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: 'center', vertical: 'center' }
        };

        // Encabezados de tabla (fila 4)
        const encabezados = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4', 'K4', 'L4', 'M4', 'N4'];
        encabezados.forEach(celda => {
            if (!worksheet[celda]) worksheet[celda] = {};
            worksheet[celda].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "CCCCCC" } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                }
            };
        });

        // Nombre de la hoja (máximo 31 caracteres)
        let nombreHoja = (`${firstChar(funcionario.nombre)} ${firstChar(funcionario.apellido)}`).toUpperCase();

        // Agregar hoja al workbook
        utils.book_append_sheet(workbook, worksheet, nombreHoja);
    });

    // Generar nombre del archivo
    let fechaDsd = data.fechadesde;
    fechaDsd = fechaDsd.slice(8, 10) + '/' + fechaDsd.slice(5, 7) + '/' + fechaDsd.slice(0, 4);
    let fechaHst = data.fechahasta;
    fechaHst = fechaHst.slice(8, 10) + '/' + fechaHst.slice(5, 7) + '/' + fechaHst.slice(0, 4);
    const nombreArchivo = `CÁLCULOS_HORAS_EXTRAS-${fechaDsd}-HASTA-${fechaHst}.xlsx`;

    // Descargar el archivo
    writeFileXLSX(workbook, nombreArchivo);
}

export { generarExcel };
