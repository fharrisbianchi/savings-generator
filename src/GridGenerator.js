import React from 'react';

export const generateGridForWeb = (periodType, periodValue, savingsPerPeriod, numColumns) => {
    const isDays = periodType === 'days';
    const rows = Math.ceil(periodValue / numColumns);
    let currentPeriod = 1;
    let totalValue = 0;

    const tableRows = [];
    for (let i = 0; i < rows; i++) {
        const tableColumns = [];
        for (let j = 0; j < numColumns; j++) {
            if (currentPeriod <= periodValue) {
                const value = currentPeriod * savingsPerPeriod;
                totalValue += value; // Acumula el valor total
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

    tableRows.push(
        <tr key="total-row">
            <td colSpan={numColumns}>Total Value: {totalValue}</td>
        </tr>
    );

    return (
        <table id="table" className="table savings-table">
            <tbody>{tableRows}</tbody>
        </table>
    );
};

export const generateGridForExcel = (periodType, periodValue, savingsPerPeriod, numColumns) => {
    const isDays = periodType === 'days';
    const rows = Math.ceil(periodValue / numColumns);
    let currentPeriod = 1;
    let totalValue = 0;

    const gridData = [];
    for (let i = 0; i < rows; i++) {
        const rowData = [];
        for (let j = 0; j < numColumns; j++) {
            if (currentPeriod <= periodValue) {
                const value = currentPeriod * savingsPerPeriod;
                totalValue += value; // Accumulate the total value
                rowData.push({
                    value: value,
                    label: `${isDays ? 'Day' : 'Week'} ${currentPeriod}`
                });
                currentPeriod++;
            } else {
                rowData.push({ value: null, label: null });
            }
        }
        gridData.push(rowData);
    }

    console.log(gridData);
    return gridData; // Return the array of rows
};

