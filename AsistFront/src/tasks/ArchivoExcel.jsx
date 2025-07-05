import ExcelJS from 'exceljs';
import { LogoBase64 } from "../utils/LogoBase64";
import { getTurno } from '../services/turno.service';
import { useState } from 'react';

const generarExcel = async (data) => {
    const { fechadesde, fechahasta, listafuncionarios } = data;

    // Crear imagen
    const logo = await LogoBase64();

    // Crear workbook con ExcelJS
    const workbook = new ExcelJS.Workbook();

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha + 'T00:00:00Z');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

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
    };

    const firstChar = (text) => {
        const texts = text.trim().split(/\s+/);
        return capitalize(texts[0]);
    };

    const formatearPeriodo = () => {
        return `${formatearFecha(fechadesde)} AL ${formatearFecha(fechahasta)}`;
    };

    const formatearNumero = (valor) => {
        if (!valor || isNaN(Number(valor))) {
            return valor;
        }
        return Number(valor).toLocaleString("es-PY");
    };

    function minutosAFormatoHora(minutosTotales) {
        const horas = Math.floor(minutosTotales / 60);
        const minutos = minutosTotales % 60;
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    };

    function restarHoras(horaInicio, horaFin) {
        const [h1, m1] = horaInicio.split(":").map(Number);
        const [h2, m2] = horaFin.split(":").map(Number);

        const minutosInicio = h1 * 60 + m1;
        const minutosFin = h2 * 60 + m2;

        const diferenciaMinutos = minutosFin - minutosInicio;
        return minutosAFormatoHora(diferenciaMinutos);
    };

    // Función para aplicar bordes a un rango fusionado
    const aplicarBordesRangoFusionado = (worksheet, rango) => {
        const [startCell, endCell] = rango.split(':');
        const startCol = startCell.match(/[A-Z]+/)[0];
        const startRow = parseInt(startCell.match(/\d+/)[0]);
        const endCol = endCell.match(/[A-Z]+/)[0];
        const endRow = parseInt(endCell.match(/\d+/)[0]);

        // Convertir letras de columna a números
        const colToNum = (col) => {
            let result = 0;
            for (let i = 0; i < col.length; i++) {
                result = result * 26 + (col.charCodeAt(i) - 64);
            }
            return result;
        };

        const startColNum = colToNum(startCol);
        const endColNum = colToNum(endCol);

        // Aplicar bordes a todas las celdas del rango
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startColNum; col <= endColNum; col++) {
                const cell = worksheet.getCell(row, col);
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        }
    };



    // Procesar cada funcionario
    listafuncionarios.forEach((funcionario, index) => {
        const nombreCompleto = (`${funcionario.apellido}, ${funcionario.nombre}`).toUpperCase();
        const cargoLab = funcionario.cargo.cargo.toUpperCase();

        // Crear worksheet
        let nombreHoja = (`${firstChar(funcionario.nombre)} ${firstChar(funcionario.apellido)}`).toUpperCase();

        const worksheet = workbook.addWorksheet(nombreHoja);

        // Configurar anchos de columna
        worksheet.columns = [
            { width: 14 },
            { width: 14 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
            { width: 18 },
            { width: 18 },
            { width: 18 },
            { width: 18 },
            { width: 18 },
            { width: 18 },
            { width: 18 },
        ];

        // Agregar logo si existe
        if (logo.tipo) {
            // Limpiar el base64
            let base64Clean = logo.base;

            // Convertir base64 a Uint8Array (compatible con navegador)
            const binaryString = atob(base64Clean);
            const logoBuffer = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                logoBuffer[i] = binaryString.charCodeAt(i);
            }

            // Agregar imagen
            const imageId = workbook.addImage({
                buffer: logoBuffer,
                extension: logo.tipo
            });

            // Posicionar imagen
            worksheet.addImage(imageId, {
                tl: { col: 0, row: 0 },
                br: { col: 1, row: 2 },
                editAs: 'twoCell'
            });
        }

        // Título
        const titleCell = worksheet.getCell('B1');
        titleCell.value = 'PLANILLA DE CONTROL - HORAS EXTRAS';
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.mergeCells('B1:N2');

        // Imagen
        worksheet.mergeCells('A1:A2');

        // Información del funcionario
        const funcionarioCell = worksheet.getCell('A3');
        funcionarioCell.value = {
            richText: [
                { text: 'FUNCIONARIO: ', font: { bold: true } },
                { text: nombreCompleto, font: { bold: false } }
            ]
        };
        worksheet.mergeCells('A3:E3');

        const cinCell = worksheet.getCell('F3');
        cinCell.value = {
            richText: [
                { text: 'CIN°: ', font: { bold: true } },
                { text: formatearNumero(funcionario.nrodoc), font: { bold: false } }
            ]
        };
        worksheet.mergeCells('F3:H3');

        const cargoCell = worksheet.getCell('I3');
        cargoCell.value = {
            richText: [
                { text: 'CARGO: ', font: { bold: true } },
                { text: cargoLab, font: { bold: false } }
            ]
        };
        worksheet.mergeCells('I3:K3');

        const periodoCell = worksheet.getCell('L3');
        periodoCell.value = {
            richText: [
                { text: 'PERIODO: ', font: { bold: true } },
                { text: formatearPeriodo(), font: { bold: false } }
            ]
        };
        worksheet.mergeCells('L3:N3');

        // Encabezados
        const headers = [
            'DÍA', 'FECHA', 'ENTRADA', 'SALIDA', 'H. TOTAL', 'DESCANSO', 'TOTAL',
            'H. NORMALES', 'H. NORM. NOCT.', 'H. NORM. MD.', 'H. NORM. MN.',
            'H. EXTRAS NORM.', 'H. EXTRAS NOCT.', 'H. EXTRAS 100%'
        ];

        headers.forEach((header, colIndex) => {
            const cell = worksheet.getCell(4, colIndex + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD9D9D9' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Variables para totales
        let totalt = 0;
        let totalhn = 0;
        let totalhnn = 0;
        let totalhnmd = 0;
        let totalhnmn = 0;
        let totalhen = 0;
        let totalhent = 0;
        let totalhextras = 0;
        let currentRow = 5;

        // Datos diarios
        funcionario.detalles.forEach((detalle, diaIndex) => {
            const diaSemana = obtenerDiaSemana(detalle.fecha);
            const fechaFormateada = formatearFecha(detalle.fecha);

            let htotal = '00:00';
            let descanso = '01:00';
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
                // total = calcularHorasTrabajadasDecimal(detalle.horaent, detalle.horasal, descanso);
                horasn = 8.0;
                horasnn = 7.0;
                horasnmd = 7.5;
                horasnmn = 7.5;
            }

            // Agregar datos a la fila
            const rowData = [
                diaSemana,
                fechaFormateada,
                detalle.feriado ? null : detalle.horaent || '00:00',
                detalle.feriado ? null : detalle.horasal || '00:00',
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
            ];

            rowData.forEach((value, colIndex) => {
                const cell = worksheet.getCell(currentRow, colIndex + 1);
                cell.value = value;
                if (diaSemana == 'domingo') {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF7DC5DB' }
                    };
                };
                if ([0, 1, 2, 3, 4, 5].includes(colIndex)) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            if (detalle.feriado) {
                worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
                const feriadoCell = worksheet.getCell(`C${currentRow}`);
                feriadoCell.value = 'FERIADO';
                feriadoCell.alignment = { horizontal: 'center', vertical: 'middle' };
                feriadoCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF9FE890' }
                };
                // Aplicar bordes a la celda fusionada
                aplicarBordesRangoFusionado(worksheet, `C${currentRow}:D${currentRow}`);
            }

            // Actualizar totales
            totalt += total;
            totalhn += horasn;
            totalhnn += horasnn;
            totalhnmd += horasnmd;
            totalhnmn += horasnmn;
            totalhen += horasen;
            totalhent += horasent;
            totalhextras += horasextras;

            currentRow++;
        });

        // Fila de totales
        const totalRow = currentRow;
        worksheet.getCell(totalRow, 1).value = 'TOTAL HORAS';
        worksheet.getCell(totalRow, 1).font = { bold: true };
        worksheet.getCell(totalRow, 1).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(totalRow, 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' }
        };
        worksheet.mergeCells(`A${totalRow}:F${totalRow}`);

        // Aplicar bordes a la celda fusionada de totales
        aplicarBordesRangoFusionado(worksheet, `A${totalRow}:F${totalRow}`);

        const totales = [totalt, totalhn, totalhnn, totalhnmd, totalhnmn, totalhen, totalhent, totalhextras];
        totales.forEach((total, index) => {
            const cell = worksheet.getCell(totalRow, index + 7);
            cell.value = total;
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD9D9D9' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        aplicarBordesRangoFusionado(worksheet, 'A1:A2');
        aplicarBordesRangoFusionado(worksheet, 'B1:N2');
        aplicarBordesRangoFusionado(worksheet, 'A3:E3');
        aplicarBordesRangoFusionado(worksheet, 'F3:H3');
        aplicarBordesRangoFusionado(worksheet, 'I3:K3');
        aplicarBordesRangoFusionado(worksheet, 'L3:N3');
    });

    // Generar nombre del archivo
    let fechaDsd = data.fechadesde;
    fechaDsd = fechaDsd.slice(8, 10) + '/' + fechaDsd.slice(5, 7) + '/' + fechaDsd.slice(0, 4);
    let fechaHst = data.fechahasta;
    fechaHst = fechaHst.slice(8, 10) + '/' + fechaHst.slice(5, 7) + '/' + fechaHst.slice(0, 4);
    const nombreArchivo = `CÁLCULOS_HORAS_EXTRAS-${fechaDsd}-HASTA-${fechaHst}.xlsx`;

    // Generar y descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
}

export { generarExcel };
