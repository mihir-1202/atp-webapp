import React, { useState } from 'react';
import styles from './FormHeadingBuilder.module.css';

export default function FormHeadingBuilder({index, role, removeItem, defaultValue = "", register, setLastClicked})
{
    function handleClick()
    {
        setLastClicked({index: index, role: role});
    }

    return(
        <li className={styles.headingItem} data-role={role} onClick = {handleClick}>
            <div className={styles.itemBoxHeader}>
                <h3>Heading</h3>
                <button className={styles.removeItemButton} type="button" onClick = {() => removeItem(index)}>−</button>
            </div>
            <div className={styles.headingInputContainer}>
                <div className={`${styles.inputGroup} ${styles.headingInputGroup}`} id="heading-input-group">
                    <label htmlFor={`${role}-heading-${index}`} className={styles.inputLabel}>Heading Text</label>
                    <input 
                        id={`${role}-heading-${index}`} 
                        className="heading-input" 
                        type="text" 
                        placeholder="Enter Heading" 
                        defaultValue={defaultValue}
                        required 
                        {...register(`sections.${role}.items.${index}.content`)}
                    />
                </div>
            </div>
        </li>
    )
}
