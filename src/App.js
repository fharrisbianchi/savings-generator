import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const App = () => {
  const [periodType, setPeriodType] = useState('days'); // Default period type is days
  const [periodValue, setPeriodValue] = useState(1);
  const [savingsPerPeriod, setSavingsPerPeriod] = useState(0);
  const [gridGenerated, setGridGenerated] = useState(false);

  const handlePeriodTypeChange = (event) => {
    setPeriodType(event.target.value);
    setGridGenerated(false); // Reset grid generation when period type changes
  };

  const handlePeriodValueChange = (event) => {
    setPeriodValue(event.target.value);
    setGridGenerated(false); // Reset grid generation when period value changes
  };

  const handleSavingsPerPeriodChange = (event) => {
    setSavingsPerPeriod(event.target.value);
    setGridGenerated(false); // Reset grid generation when savings per period changes
  };

  const handleExportToExcel = () => {
    // Find the table element by class name
    const table = document.querySelector('.savings-table');

    // Check if the table element exists and is an HTML table
    if (table && table.tagName.toLowerCase() === 'table') {
      // Clone the table to preserve the original
      const clonedTable = table.cloneNode(true);

      // Create a new HTML document to hold the table
      const excelHtml = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Savings Data</title>
          </head>
          <body>
            ${clonedTable.outerHTML}
          </body>
        </html>
      `;

      // Convert the HTML to a Blob
      const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel' });

      // Create a link element
      const link = document.createElement('a');

      // Set the link's href attribute to a data URL representing the Blob
      link.href = URL.createObjectURL(blob);

      // Specify the filename for the download
      link.download = 'savings_data.xls';

      // Programmatically click the link to trigger the download
      link.click();
    } else {
      // Log an error message if the table is not found or not an HTML table
      console.error('Provided table property is not an HTML table element');
    }
  };

  const generateGrid = () => {
    const isDays = periodType === 'days';
    const rows = Math.ceil(periodValue / 7);
    let currentPeriod = 1;
    let totalValue = 0;

    const tableRows = [];
    for (let i = 0; i < rows; i++) {
      const tableColumns = [];
      for (let j = 0; j < 7; j++) {
        if (currentPeriod <= periodValue) {
          const value = currentPeriod * savingsPerPeriod;
          totalValue = value;
          tableColumns.push(
            <td key={currentPeriod}>
              <div>
                <span className="badge rounded-pill bg-primary">{isDays ? 'Day' : 'Week'} {currentPeriod}: </span>
                <div>{value}</div>
              </div>
            </td>
          );
          currentPeriod++;
        } else {
          tableColumns.push(<td key={`placeholder-${j}`} />);
        }
      }
      tableRows.push(<tr key={i}>{tableColumns}</tr>);
    }

    // Add row for total value
    tableRows.push(
      <tr key="total-row">
        <td colSpan="7">Total Value: {totalValue}</td>
      </tr>
    );

    return (
      <table id="table" className="table savings-table">
        <tbody>{tableRows}</tbody>
      </table>
    );
  };

  const handleClickGenerateGrid = () => {
    setGridGenerated(true);
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col mt-3">
          <label htmlFor="periodTypeInput" className="form-label">
            Period Type:
          </label>
          <select
            className="form-select"
            id="periodTypeInput"
            value={periodType}
            onChange={handlePeriodTypeChange}
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
          </select>
        </div>
        <div className="col mt-3">
          <label htmlFor="periodValueInput" className="form-label">
            Number of {periodType === 'days' ? 'Days' : 'Weeks'}:
          </label>
          <input
            type="number"
            className="form-control"
            id="periodValueInput"
            value={periodValue}
            onChange={handlePeriodValueChange}
          />
        </div>
        <div className="col mt-3">
          <label htmlFor="savingsInput" className="form-label">
            Savings per {periodType === 'days' ? 'Day' : 'Week'}:
          </label>
          <input
            type="number"
            className="form-control"
            id="savingsInput"
            value={savingsPerPeriod}
            onChange={handleSavingsPerPeriodChange}
          />
        </div>
        <div className="col mt-5">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleClickGenerateGrid}
          >
            Generate Grid
          </button>
        </div>
        <div className="col mt-5">

          {gridGenerated && (
            <ReactHTMLTableToExcel
              id="test-table-xls-button"
              className="btn btn-success"
              table="table" // Cambiado a savingsTable
              filename="savings_data"
              sheet="savings_data"
              buttonText="Export to Excel"
              onClick={handleExportToExcel}
            />
          )}

        </div>
      </div>
      {gridGenerated && (
        <div className="row mt-3">
          <div className="col">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Savings Grid</h5>
                <div className="container" id="savingsGrid">
                  {generateGrid()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
