import * as XLSX from 'xlsx';
import { generateGridForExcel } from './GridGenerator';

const extractDataFromGrid = (gridData) => {
    let data = [];

    gridData.forEach((row) => {
        let rowData = [];
        row.forEach((cell) => {
            const cellValue = cell.value; // Obtener el valor de la celda del objeto de datos
            rowData.push(cellValue); // Agregar el valor de la celda a los datos
        });
        data.push(rowData);
    });

    for (let i = 0; i < data.length; i += 2) {
        const dayRow = new Array(data[i].length).fill('');
        const dayData = gridData[i / 2].map(cell => cell.label);
        dayRow.splice(0, dayData.length, ...dayData);
        data.splice(i, 0, dayRow);
    }

    return { data };
};


export const exportToExcel = (periodType, periodValue, savingsPerPeriod, numColumns, fileName = 'savings_data.xlsx') => {
    // Generate grid data for Excel
    const gridData = generateGridForExcel(periodType, periodValue, savingsPerPeriod, numColumns);

    // Check if gridData is empty or undefined
    if (!gridData || gridData.length === 0) {
        console.error('Grid data is missing or empty');
        return;
    }

    // Extract data from grid
    let { data } = extractDataFromGrid(gridData);

    // Add a row at the end for the total amount saved
    const totalRow = ['Total', ...data[0].slice(2).map(cell => isNaN(cell) ? '' : Number(cell)).reduce((acc, val) => acc + val, 0)];
    data.push(totalRow);

    // Convert data to Excel sheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ahorro');

    // Convert workbook to binary string
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // Convert binary string to Blob
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};


const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
};
