import React, { useState } from 'react';
import styles from './FormFieldBuilder.module.css';

export default function FormFieldBuilder({order, role, id, removeItem, defaultValue = "", register})
{
    return(
        <li className={styles.fieldItem}>
            <div className={styles.itemBoxHeader}>
                <h3>Field</h3>
                <button className={styles.removeItemButton} type="button" onClick={() => removeItem(order)}>−</button>
            </div>
            <div className={styles.fieldInputsContainer}>
                
                <div className={styles.inputGroup} id={styles.questionInputGroup}>
                    <label htmlFor={`${role}-question-${order}`} className={styles.inputLabel}>Question</label>
                    <input 
                        id={`${role}-question-${order}`} 
                        className="question-input" 
                        type="text" 
                        placeholder="Enter question" 
                        defaultValue={defaultValue || ""}
                        {...register(`sections.${role}.items.${order}.question`)}
                    />
                </div>

                <div className={styles.inputGroup} id={styles.answerFormatInputGroup}>
                    <label htmlFor={`${role}-answer-format-${order}`} className={styles.inputLabel}>Answer Format</label>
                    <select 
                        key={id} 
                        id = {id}
                        required
                        className="answer-format-input" 
                        {...register(`sections.${role}.items.${order}.answerFormat`)}
                        defaultValue = {defaultValue || "text"}
                    >
                        <option value="text" >Text Input</option>
                        <option value="textarea" >Text Area</option>
                        <option value="number" >Number</option>
                        <option value="date" >Date</option>
                        
                    </select>
                </div>

                <div className={styles.inputGroup} id={styles.spreadsheetCellInputGroup}>
                        <label htmlFor={`${role}-cell-${order}`} className={styles.inputLabel}>
                            Spreadsheet Cell ID
                        </label>
                        <input 
                            key={id} 
                            id = {id}
                            className={styles.cellInput} 
                            type="text" 
                            placeholder="e.g., A1, B5, C10" 
                            {...register(`sections.${role}.items.${order}.spreadsheetCell`)}
                        />
                </div>

            </div>
        </li>
    );
}
