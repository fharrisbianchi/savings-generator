import React from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslations from './lang/es.json';

// Configura i18next con las traducciones de es.json
i18n
    .use(initReactI18next)
    .init({
        lng: 'es', // Establece el idioma inicial
        fallbackLng: 'en', // Idioma de respaldo
        resources: {
            es: {
                translation: esTranslations
            }
        },
        interpolation: {
            escapeValue: false // No es necesario escapar los valores
        }
    });

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
                totalValue = value; // Accumulate the total value
                tableColumns.push(
                    <td key={currentPeriod}>
                        <div>
                            <span className="badge rounded-pill bg-primary">
                                {isDays ? i18n.t('day') : periodType === 'weeks' ? i18n.t('week') : periodType === 'months' ? i18n.t('month') : ''}
                                {isDays ? ' ' : ' '}
                                {currentPeriod}:
                            </span>

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
            <td colSpan={numColumns}>{i18n.t('total_value')} {totalValue}</td>
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
                    label: `${isDays ? i18n.t('day') : periodType === 'weeks' ? i18n.t('week') : periodType === 'months' ? i18n.t('month') : ''} ${isDays ? ' ' : ' '} ${currentPeriod}`
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

