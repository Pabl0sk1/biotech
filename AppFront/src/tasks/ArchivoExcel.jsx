import ExcelJS from 'exceljs';
import { LogoImg } from "../utils/LogoImg";
import { HostLocation } from '../utils/HostLocation';

const generarExcel = async (data) => {
    const { cantdias, fechadesde, fechahasta, listafuncionarios } = data;

    // Crear imagen
    const logo = await LogoImg();

    // Crear workbook con ExcelJS
    const workbook = new ExcelJS.Workbook();

    const estilos = {
        borde: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        },
        alineacion: { horizontal: 'center', vertical: 'middle' },
        titulo: { bold: true, size: 14 },
        negrita: { bold: true },
        normal: { bold: false },
        bgCabecera: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' }
        },
        bgDomingo: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF7DC5DB' }
        },
        bgFeriado: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF9FE890' }
        },
        bgHoja: { argb: 'FF9FE890' }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha + 'T00:00:00Z');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
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
                cell.border = estilos.borde;
            }
        }
    };

    async function getImageBuffer(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error cargando la imagen: ${res.status}`);
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }

    // Procesar cada funcionario
    listafuncionarios.forEach((funcionario) => {
        const nombreCompleto = (`${funcionario.apellido}, ${funcionario.nombre}`).toUpperCase();
        const cargoLab = funcionario.cargo.cargo.toUpperCase();

        // Crear worksheet
        let nombreHoja = (`${firstChar(funcionario.nombre)} ${firstChar(funcionario.apellido)}`).toUpperCase();

        const worksheet = workbook.addWorksheet(nombreHoja, {
            properties: {
                tabColor: estilos.bgHoja
            }
        });

        // Configurar anchos de columna
        const widths = [18, 14, 12, 12, 12, 12, 18, 18, 18, 18, 18, 18, 18, 18];
        worksheet.columns = widths.map(w => ({ width: w }));

        // Agregar logo si existe
        if (logo.tipo) {
            const imgUrl = HostLocation(1) + logo.imagen;

            const logoBuffer = getImageBuffer(imgUrl);
            const imageId = workbook.addImage({
                buffer: logoBuffer,
                extension: logo.tipo
            });
            worksheet.addImage(imageId, {
                tl: { col: 0, row: 0 },
                ext: { width: 70, height: 40 },
                editAs: 'oneCell'
            });
        };

        // Título
        const titleCell = worksheet.getCell('B1');
        titleCell.value = 'PLANILLA DE CONTROL - HORAS EXTRAS';
        titleCell.font = estilos.titulo;
        titleCell.alignment = estilos.alineacion;
        worksheet.mergeCells('B1:N2');

        // Imagen
        worksheet.mergeCells('A1:A2');

        // Información del funcionario
        const funcionarioCell = worksheet.getCell('A3');
        funcionarioCell.value = {
            richText: [
                { text: 'FUNCIONARIO: ', font: estilos.negrita },
                { text: nombreCompleto, font: estilos.normal }
            ]
        };
        worksheet.mergeCells('A3:E3');

        const cinCell = worksheet.getCell('F3');
        cinCell.value = {
            richText: [
                { text: 'CIN°: ', font: estilos.negrita },
                { text: formatearNumero(funcionario.nrodoc), font: estilos.normal }
            ]
        };
        worksheet.mergeCells('F3:H3');

        const cargoCell = worksheet.getCell('I3');
        cargoCell.value = {
            richText: [
                { text: 'CARGO: ', font: estilos.negrita },
                { text: cargoLab, font: estilos.normal }
            ]
        };
        worksheet.mergeCells('I3:K3');

        const periodoCell = worksheet.getCell('L3');
        periodoCell.value = {
            richText: [
                { text: 'PERIODO: ', font: estilos.negrita },
                { text: formatearPeriodo(), font: estilos.normal }
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
            cell.font = estilos.negrita;
            cell.alignment = estilos.alineacion;
            cell.fill = estilos.bgCabecera;
            cell.border = estilos.borde;
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
        let salario = funcionario.salario;
        let jornal = (salario / cantdias);
        let sph = (jornal / 8);

        // Datos diarios
        funcionario.detalles.forEach((detalle, diaIndex) => {
            const diaSemana = detalle.dia;
            const fechaFormateada = formatearFecha(detalle.fecha);

            let ent = detalle.horaent || '00:00';
            let sal = detalle.horasal || '00:00';
            let htotal = detalle.htotal || '00:00';
            let descanso = detalle.horades || '00:00';
            let total = detalle.total || 0;
            let horasn = detalle.hn || 0;
            let horasnn = detalle.hnn || 0;
            let horasnmd = detalle.hnmd || 0;
            let horasnmn = detalle.hnmn || 0;
            let horasen = detalle.hen || 0;
            let horasent = detalle.hent || 0;
            let horasextras = detalle.hextras || 0;

            // Agregar datos a la fila
            const rowData = [
                diaSemana,
                fechaFormateada,
                ent,
                sal,
                htotal,
                descanso,
                total,
                horasn,
                horasnn,
                horasnmd,
                horasnmn,
                horasen,
                horasent,
                horasextras
            ];

            rowData.forEach((value, colIndex) => {
                const cell = worksheet.getCell(currentRow, colIndex + 1);
                cell.value = value;
                if (diaSemana == 'domingo') {
                    cell.fill = estilos.bgDomingo;
                };
                if ([6, 7, 8, 9, 10, 11, 12, 13].includes(colIndex) && value != 0) {
                    cell.numFmt = '0.00';
                }
                if ([0, 1, 2, 3, 4, 5].includes(colIndex)) {
                    cell.alignment = estilos.alineacion;
                }
                cell.border = estilos.borde;
            });

            if (detalle.feriado && !total) {
                worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
                const feriadoCell = worksheet.getCell(`C${currentRow}`);
                feriadoCell.value = 'FERIADO';
                feriadoCell.alignment = estilos.alineacion;
                feriadoCell.fill = estilos.bgFeriado;
                aplicarBordesRangoFusionado(worksheet, `C${currentRow}:D${currentRow}`);
            } else if (detalle.feriado) {
                const feriadoCell = worksheet.getCell(`C${currentRow}`);
                feriadoCell.fill = estilos.bgFeriado;
                const feriadoCell2 = worksheet.getCell(`D${currentRow}`);
                feriadoCell2.fill = estilos.bgFeriado;
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
        const totales = ['TOTAL HORAS', totalt, totalhn, totalhnn, totalhnmd, totalhnmn, totalhen, totalhent, totalhextras];
        totales.forEach((total, index) => {
            let v = 1;
            if (index) v = 6;
            const cell = worksheet.getCell(currentRow, index + v);
            cell.value = total;
            cell.font = estilos.negrita;
            cell.fill = estilos.bgCabecera;
            cell.border = estilos.borde;
            if (index) cell.value = { formula: `SUM(${worksheet.getColumn(index + v).letter}5:${worksheet.getColumn(index + v).letter}${currentRow - 1})` };
            if (total != 0 && index) cell.numFmt = '0.00';
            if (!index) {
                cell.alignment = estilos.alineacion;
                worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
            }
        });

        const nextRow = currentRow + 2;

        // Tabla de Resumen
        const resumen = worksheet.getCell(`A${nextRow}`);
        resumen.value = 'RESUMEN';
        resumen.font = estilos.negrita;
        worksheet.mergeCells(`A${nextRow}:D${nextRow}`);
        const rows = [
            {
                label: 'CONCEPTO',
                val2: 'SALARIO P/H',
                val3: 'CANT. H.',
                val4: 'TOTAL'
            },
            {
                label: 'H. NORMALES',
                val2: sph,
                val3: totalhn,
                val4: sph * totalhn
            },
            {
                label: 'H. NORM. NOCT.',
                val2: sph * 1.3 - sph,
                val3: totalhnn,
                val4: (sph * 1.3 - sph) * totalhnn
            },
            {
                label: 'H. NORM. MD.',
                val2: sph,
                val3: totalhnmd,
                val4: sph * totalhnmd
            },
            {
                label: 'H. NORM. MN.',
                val2: sph * 1.3 - sph,
                val3: totalhnmn,
                val4: (sph * 1.3 - sph) * totalhnmn
            },
            {
                label: 'H. EXTRAS NORM.',
                val2: sph * 1.5,
                val3: totalhen,
                val4: (sph * 1.5) * totalhen
            },
            {
                label: 'H. EXTRAS NOCT.',
                val2: sph * 1.3 * 2,
                val3: totalhent,
                val4: (sph * 1.3 * 2) * totalhent
            },
            {
                label: 'H. EXTRAS 100%',
                val2: sph * 2,
                val3: totalhextras,
                val4: (sph * 2) * totalhextras
            }
        ];
        let totalcanth = 0;
        let totalizado = 0;
        rows.forEach((row, idx) => {
            const r = nextRow + idx + 1;
            const c = idx + 7;
            const cell1 = worksheet.getCell(r, 1);
            const cell2 = worksheet.getCell(r, 2);
            const cell3 = worksheet.getCell(r, 3);
            const cell4 = worksheet.getCell(r, 4);
            cell1.value = row.label;
            cell2.value = row.val2;
            cell3.value = row.val3;
            cell4.value = row.val4;
            if (!idx) {
                [cell1, cell2, cell3, cell4].forEach(c => {
                    c.font = estilos.negrita;
                    c.alignment = estilos.alineacion;
                    c.fill = estilos.bgCabecera;
                });
            }
            [cell1, cell2, cell3, cell4].forEach(c => c.border = estilos.borde);
            if (idx) {
                [cell2, cell3, cell4].forEach(c => c.numFmt = '#,##0');
                totalcanth += row.val3;
                totalizado += row.val4;
            };
            if (row.val3 != 0 && idx) cell3.numFmt = '0.00';
        });
        const rowsTotal = ['TOTAL', totalcanth, totalizado];
        rowsTotal.forEach((total, index) => {
            let v = 1;
            if (index) v = 2;
            const cell = worksheet.getCell(nextRow + 9, index + v);
            cell.value = total;
            cell.font = estilos.negrita;
            cell.fill = estilos.bgCabecera;
            cell.border = estilos.borde;
            if (total != 0 && index == 1) cell.numFmt = '0.00';
            if (index == 2) cell.numFmt = '#,##0';
            if (!index) {
                cell.alignment = estilos.alineacion;
                worksheet.mergeCells(`A${nextRow + 9}:B${nextRow + 9}`);
            }
        });

        // Tabla de artículo
        const articulo = worksheet.getCell(`J${nextRow}`);
        articulo.value = 'ART. 235 CÓDIGO LABORAL';
        articulo.font = estilos.negrita;
        worksheet.mergeCells(`J${nextRow}:N${nextRow}`);
        const rows2 = [
            {
                label: 'CONCEPTO',
                value: 'SALARIO P/H'
            },
            {
                label: 'HORAS NORMALES',
                value: sph
            },
            {
                label: 'HORAS NORMALES NOCTURNAS 30%',
                value: sph * 1.3
            },
            {
                label: 'HORAS NORMALES MIXTO DIURNAS',
                value: sph
            },
            {
                label: 'HORAS NORMALES MIXTO NOCTURNAS 30%',
                value: sph * 1.3
            },
            {
                label: 'HORAS EXTRAS NORMALES 50%',
                value: sph * 1.5
            },
            {
                label: 'HORAS EXTRAS NOCTURNAS 100%',
                value: sph * 1.3 * 2
            },
            {
                label: 'HORAS EXTRAS AL 100% (FERIADOS Y DOMINGOS)',
                value: sph * 2
            }
        ];
        rows2.forEach((row, idx) => {
            const r = nextRow + idx + 1;
            const cell1 = worksheet.getCell(r, 10);
            const cell2 = worksheet.getCell(r, 14);
            cell1.value = row.label;
            cell2.value = row.value;
            [cell1, cell2].forEach(c => c.border = estilos.borde);
            if (!idx) {
                [cell1, cell2].forEach(c => {
                    c.font = estilos.negrita;
                    c.alignment = estilos.alineacion;
                    c.fill = estilos.bgCabecera;
                });
            }
            if (idx) cell2.numFmt = '#,##0';
            worksheet.mergeCells(`J${nextRow + idx + 1}:M${nextRow + idx + 1}`);
        });

        const nextRow2 = nextRow + 11;

        // Tabla de salarios
        const calculo = worksheet.getCell(`A${nextRow2}`);
        calculo.value = 'CÁLCULOS DE SALARIO';
        calculo.font = estilos.negrita;
        worksheet.mergeCells(`A${nextRow2}:D${nextRow2}`);
        const rows3 = [
            {
                label: 'CONCEPTO',
                val2: 'TOTAL',
                val3: 'JORNAL',
                val4: 'SALARIO P/H'
            },
            {
                label: 'SALARIO MÍNIMO',
                val2: salario,
                val3: jornal,
                val4: sph
            }
        ];
        rows3.forEach((row, idx) => {
            const r = nextRow2 + idx + 1;
            const cell1 = worksheet.getCell(r, 1);
            const cell2 = worksheet.getCell(r, 2);
            const cell3 = worksheet.getCell(r, 3);
            const cell4 = worksheet.getCell(r, 4);
            cell1.value = row.label;
            cell2.value = row.val2;
            cell3.value = row.val3;
            cell4.value = row.val4;
            if (!idx) {
                [cell1, cell2, cell3, cell4].forEach(c => {
                    c.font = estilos.negrita;
                    c.alignment = estilos.alineacion;
                    c.fill = estilos.bgCabecera;
                });
            }
            [cell1, cell2, cell3, cell4].forEach(c => c.border = estilos.borde);
            if (idx) [cell2, cell3, cell4].forEach(c => c.numFmt = '#,##0');
        });

        aplicarBordesRangoFusionado(worksheet, `A${currentRow}:F${currentRow}`);
        aplicarBordesRangoFusionado(worksheet, `J${nextRow + 1}:M${nextRow + 1}`);
        aplicarBordesRangoFusionado(worksheet, `A${nextRow + 9}:B${nextRow + 9}`);
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
