import React from 'react';
import styles from './SpreadsheetCellMapper.module.css';

export default function SpreadsheetCellMapper({ order, role, register }) {
    return (
        <div className={styles.cellMapperContainer}>
            <div className={styles.inputGroup}>
                <label htmlFor={`${role}-cell-${order}`} className={styles.inputLabel}>
                    Spreadsheet Cell ID
                </label>
                <input 
                    id={`${role}-cell-${order}`} 
                    className={styles.cellInput} 
                    type="text" 
                    placeholder="e.g., A1, B5, C10" 
                    {...register(`sections.${role}.items.${order}.spreadsheetCell`)}
                />
            </div>
        </div>
    );
}
