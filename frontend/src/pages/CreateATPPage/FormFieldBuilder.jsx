import React, { useState } from 'react';
import styles from './FormFieldBuilder.module.css';
import SpreadsheetCellMapper from './SpreadsheetCellMapper';

export default function FormFieldBuilder({order, role, removeItem, register})
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
                        {...register(`sections.${role}.items.${order}.question`)}
                    />
                </div>

                <div className={styles.inputGroup} id={styles.answerFormatInputGroup}>
                    <label htmlFor={`${role}-answer-format-${order}`} className={styles.inputLabel}>Answer Format</label>
                    <select 
                        id={`${role}-answer-format-${order}`} 
                        required
                        className="answer-format-input" 
                        {...register(`sections.${role}.items.${order}.answerFormat`)}
                    >
                        <option value="text">Text Input</option>
                        <option value="textarea">Text Area</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        
                    </select>
                </div>

                <SpreadsheetCellMapper 
                    order={order} 
                    role={role} 
                    register={register} 
                />

            </div>
        </li>
    );
}
