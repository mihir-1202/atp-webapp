import React, { useState } from 'react';
import styles from './FormHeadingBuilder.module.css';

export default function FormHeadingBuilder({order, role, removeItem, register})
{
    const [headingInput, setHeadingInput] = useState("");

    function handleHeadingInputChange(event)
    {
        setHeadingInput(event.target.value);
    }

    return(
        <li className={styles.headingItem} data-role={role}>
            <div className={styles.itemBoxHeader}>
                <h3>Heading</h3>
                <button className={styles.removeItemButton} type="button" onClick = {() => removeItem(order)}>−</button>
            </div>
            <div className={styles.headingInputContainer}>
                <div className={`${styles.inputGroup} ${styles.headingInputGroup}`} id="heading-input-group">
                    <label htmlFor={`${role}-heading-${order}`} className={styles.inputLabel}>Heading Text</label>
                    <input 
                        id={`${role}-heading-${order}`} 
                        className="heading-input" 
                        type="text" 
                        placeholder="Enter Heading" 
                        required 
                        {...register(`sections.${role}.items.${order}.content`)}
                    />
                </div>
            </div>
        </li>
    )
}
