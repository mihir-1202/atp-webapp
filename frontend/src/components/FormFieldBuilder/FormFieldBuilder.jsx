import React from 'react';
import styles from './FormFieldBuilder.module.css';
import ImageInput from '../ImageInput';

export default function FormFieldBuilder({index, role, id, removeItem, defaultValue = "", register, setLastClicked, resetField, setValue, moveItem, numItems, imageUrl = null, imageBlobPath = null})
{
    function handleClick()
    {
        setLastClicked({index: index, role: role});
    }

    function handleMoveUp()
    {
        if (index > 0)
            moveItem(index, index - 1);
    }

    function handleMoveDown()
    {
       // e.stopPropagation();
        if (index < numItems - 1)
            moveItem(index, index + 1);
    }


    
    return(
        <li className={styles.fieldItem} onClick = {handleClick}>
            <div className={styles.itemBoxHeader}>
                <h3>Field</h3>
                <div className={styles.headerActions}>
                    <button className={styles.moveButton} type = "button" onClick = {handleMoveUp}>↑</button>
                    <button className={styles.moveButton} type = "button" onClick = {handleMoveDown}>↓</button>
                    <button className={styles.removeItemButton} type="button" onClick={() => removeItem(index)}>−</button>
                </div>
            </div>
            <div className={styles.fieldInputsContainer}>
                
                <div className={styles.inputGroup} id={styles.questionInputGroup}>
                    <label htmlFor={`${role}-question-${index}`} className={styles.inputLabel}>Question</label>
                    <textarea 
                        id={`${role}-question-${index}`} 
                        placeholder="Enter question" 
                        defaultValue={defaultValue || ""}
                        {...register(`sections.${role}.items.${index}.question`)}
                    >   
                    </textarea>
                </div>

                <div className={styles.inputGroup} id={styles.answerFormatInputGroup}>
                    <label htmlFor={`${role}-answer-format-${index}`} className={styles.inputLabel}>Answer Format</label>
                    <select 
                        key={id} 
                        id = {id}
                        required
                        className="answer-format-input" 
                        {...register(`sections.${role}.items.${index}.answerFormat`)}
                        defaultValue = {defaultValue || "text"}
                    >
                        <option value="text" >Text Input</option>
                        <option value="textarea" >Text Area</option>
                        <option value="number" >Number</option>
                        <option value="date" >Date</option>
                        
                    </select>
                </div>

                <div className={styles.inputGroup} id={styles.spreadsheetCellInputGroup}>
                    <label htmlFor={`${role}-cell-${index}`} className={styles.inputLabel}>
                        Spreadsheet Cell (Optional)
                    </label>
                    <input 
                        key={id} 
                        id={`${role}-cell-${index}`}
                        className={styles.cellInput} 
                        type="text" 
                        placeholder="e.g., A1, B5, C10" 
                        required = {false}
                        pattern="^[A-Z]{1,3}[1-9]\d{0,6}$" //html validation
                        title="Must be a valid Excel cell reference (e.g., A1, B5, AA10)"
                        {...register(`sections.${role}.items.${index}.spreadsheetCell`, {
                            required: false,
                            pattern: {
                                value: /^[A-Z]{1,3}[1-9]\d{0,6}$/, //react validation
                                message: "Must be a valid Excel cell reference (e.g., A1, B5, AA10)" //the error message that is displayed in the input group
                            }
                        })}
                    />
                </div>

                <ImageInput
                    id={`${role}-field-image-${index}`}
                    label="Field Image"
                    role={role}
                    index={index}
                    register={register}
                    resetField={resetField}
                    setValue={setValue}
                    imageUrl={imageUrl}
                    imageBlobPath={imageBlobPath}
                />

            </div>
        </li>
    );
}
