import React, { useState } from 'react';
import styles from '../../styles/CreateATPPage.module.css';

export default function FieldItem({order, role, removeItem, register})
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
                        className="answer-format-input" 
                        {...register(`sections.${role}.items.${order}.answerFormat`)}
                    >
                        <option value="text">Text Input</option>
                        <option value="textarea">Text Area</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>

                        {/* 
                        TODO: add checkbox and radio options after MVP is complete
                        <option value = "checkbox">Checkbox</option>
                        <option value = "radio">Radio Buttons</option> 
                        */}
                        
                    </select>
                </div>

                {/*TODO: Functionality for checkbox and radio 
                {(answerFormatInput === 'checkbox' || answerFormatInput === 'radio') && (
                    <div className = "input-group" id = "options-input-group">
                        <label className = "input-label">Options</label>
                        <div className = "options-container">
                            {options.map((option, index) => (
                                <div key={index} className="option-input-group">
                                    <input 
                                        type="text"
                                        name={`${role}-options-${order}-${index}`}
                                        placeholder={`Option ${index + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                    />
                                    <button 
                                        type="button" 
                                        className="remove-option-button"
                                        onClick={() => removeOption(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                className="add-option-button"
                                onClick={addOption}
                            >
                                + Add Option
                            </button>
                        </div>
                    </div>
                )}
                */}


            </div>
        </li>
    );
}