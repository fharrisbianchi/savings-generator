import React, { useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ReactDOMServer from 'react-dom/server'; // Import ReactDOMServer
import { generateGridForWeb } from './GridGenerator'; // Importa la función para generar la cuadrícula para la web
import { exportToExcel } from './ExportToExcel';
import { generateGridForExcel } from './GridGenerator';


import esTranslations from './lang/es.json';
import enTranslations from './lang/en.json';


// Configura i18next con las traducciones de es.json
i18n
  .use(initReactI18next)
  .init({
    lng: 'es',
    fallbackLng: 'en',
    resources: {
      es: {
        translation: esTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    interpolation: {
      escapeValue: false
    }
  });

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Update the language immediately when the currentLanguage state changes
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = (e) => {
    setCurrentLanguage(e.target.value);
  };

  return (
    <select
      className="form-select"
      id="languageSelect"
      onChange={handleLanguageChange}
      value={currentLanguage} // Usa value en lugar de defaultValue para controlar el estado del select

    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};


const App = () => {
  const [periodType, setPeriodType] = useState('days');
  const [periodValue, setPeriodValue] = useState(1);
  const [savingsPerPeriod, setSavingsPerPeriod] = useState(0);
  const [gridGenerated, setGridGenerated] = useState(false);
  const [numColumns, setNumColumns] = useState(7); // El número predeterminado de columnas es 7

  const handlePeriodTypeChange = (event) => {
    setPeriodType(event.target.value);
    setGridGenerated(false);
  };

  const handlePeriodValueChange = (event) => {
    setPeriodValue(event.target.value);
    setGridGenerated(false);
  };

  const handleSavingsPerPeriodChange = (event) => {
    setSavingsPerPeriod(event.target.value);
    setGridGenerated(false);
  };

  const handleNumColumnsChange = (event) => {
    setNumColumns(parseInt(event.target.value));
    setGridGenerated(false);
  };

  const handleClickGenerateGrid = () => {
    setGridGenerated(true);
  };

  const handleExportToExcel = () => {
    try {
      const gridData = generateGridForExcel(
        periodType,
        periodValue,
        savingsPerPeriod,
        numColumns
      ); // Genera los datos de la cuadrícula para exportar a Excel
      if (gridData.length === 0) {
        console.error('No data to export');
        return;
      }
      exportToExcel(
        periodType,
        periodValue,
        savingsPerPeriod,
        numColumns,
        'savings_data.xlsx'
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();

    // Get data for the table
    const data = generateDataForPDF(
      periodType,
      periodValue,
      savingsPerPeriod,
      numColumns
    );

    // Set styling options for the table
    const options = {
      startY: 20, // Y position to start table
      margin: { top: 20 }, // Margin top
      maxX: doc.internal.pageSize.getWidth() - 10, // Maximum X position for the table
      maxColumns: numColumns, // Maximum number of columns per page
    };

    // Add data to PDF document
    addDataToPDF(doc, data, options);

    // Save PDF
    doc.save('savings_data.pdf');
  };

  const generateDataForPDF = (
    periodType,
    periodValue,
    savingsPerPeriod,
    numColumns
  ) => {
    const isDays = periodType === 'days';
    const totalPeriods = periodValue;
    let currentPeriod = 1;
    let totalValue = 0;
    const data = [];

    while (currentPeriod <= totalPeriods) {
      const rowData = [];
      for (let j = 0; j < numColumns && currentPeriod <= totalPeriods; j++) {
        const value = currentPeriod * savingsPerPeriod;
        totalValue = value; // Accumulate the total value
        rowData.push({
          day: `${isDays ? i18n.t('day') : i18n.t('week')} ${currentPeriod}`,
          value: value,
        });
        currentPeriod++;
      }
      data.push(rowData);
    }

    // Add total row to data
    data.push([{ day: i18n.t('total_value'), value: totalValue }]);
    return data;
  };

  const addDataToPDF = (doc, data, options) => {
    const startX = 10;
    const columnWidth = (options.maxX - startX) / options.maxColumns; // Ancho de cada columna ajustado al ancho del documento
    const maxColumnsPerPage = options.maxColumns; // Número máximo de columnas por página basado en numColumns recibido
    const blockMargin = 5; // Margen entre bloques azules
    let currentY = options.startY;
    let currentX = startX;

    data.forEach((row) => {
      row.forEach((cell) => {
        // Draw blue rectangle for day without border
        doc.setFillColor(0, 128, 255); // Color de fondo azul
        doc.setDrawColor(0); // Sin borde
        doc.roundedRect(currentX, currentY, columnWidth, 15, 3, 3, 'F'); // Rectángulo azul con bordes redondeados

        // Add day text inside the rectangle
        doc.setTextColor(255, 255, 255); // Color de texto blanco
        doc.setFontSize(8); // Tamaño de fuente para el día
        doc.text(
          currentX + columnWidth / 2,
          currentY + 10,
          cell.day.toString(),
          null,
          null,
          'center'
        ); // Texto centrado del día

        // Add value below the rectangle
        doc.setTextColor(0); // Color de texto negro
        doc.setFontSize(12); // Tamaño de fuente para el valor
        doc.text(
          currentX + columnWidth / 2,
          currentY + 25,
          cell.value.toString(),
          null,
          null,
          'center'
        ); // Texto centrado del valor

        // Move to next position
        currentX += columnWidth; // Mover a la siguiente columna

        // Check if there is no space left in the current row or if it exceeds the maximum number of columns per page
        if (
          currentX >= options.maxX ||
          currentX - startX >= maxColumnsPerPage * columnWidth
        ) {
          currentX = startX; // Reiniciar X al principio de la fila
          currentY += 40; // Mover a la siguiente fila con un espacio entre bloques
        }
      });
    });
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-sm-3 mt-3">
          <label htmlFor="periodTypeInput" className="form-label">
            {i18n.t('period_type')}
          </label>
          <select
            className="form-select"
            id="periodTypeInput"
            value={periodType}
            onChange={handlePeriodTypeChange}
          >
            <option value="days">{i18n.t('days')}</option>
            <option value="weeks">{i18n.t('weeks')}</option>
            <option value="months">{i18n.t('months')}</option>
          </select>
        </div>
        <div className="col-sm-3 mt-3">
          <label htmlFor="periodValueInput" className="form-label">
            {i18n.t('number_of')} {['days', 'weeks', 'months'].includes(periodType) ? (i18n.t(periodType)) : ''}:
          </label>
          <input
            type="number"
            className="form-control"
            id="periodValueInput"
            value={periodValue}
            onChange={handlePeriodValueChange}
          />
        </div>
        <div className="col-sm-3 mt-3">
          <label htmlFor="savingsInput" className="form-label">
            {i18n.t('savings_per')} {['days', 'weeks', 'months'].includes(periodType) ? (i18n.t(periodType)) : ''}:
          </label>
          <input
            type="number"
            className="form-control"
            id="savingsInput"
            value={savingsPerPeriod}
            onChange={handleSavingsPerPeriodChange}
          />
        </div>
        <div className="col-sm-3 mt-3">
          <label htmlFor="numColumnsInput" className="form-label">
            {i18n.t('number_of_columns')}
          </label>
          <select
            className="form-select"
            id="numColumnsInput"
            value={numColumns}
            onChange={handleNumColumnsChange}
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
          </select>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-sm-8 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={handleClickGenerateGrid}
          >
            {i18n.t('generate_grid')}
          </button>
          {gridGenerated && (
            <React.Fragment>
              <button
                type="button"
                className="btn btn-success me-2"
                onClick={handleExportToExcel}
              >
                {i18n.t('export_excel')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleExportToPDF}
              >
                {i18n.t('export_pdf')}
              </button>
            </React.Fragment>
          )}
        </div>
        <div className="col-sm-4">
          <LanguageSwitcher />
        </div>
      </div>

      {gridGenerated && (
        <div className="row mt-3">
          <div className="col">
            {generateGridForWeb(
              periodType,
              periodValue,
              savingsPerPeriod,
              numColumns
            )}{' '}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
