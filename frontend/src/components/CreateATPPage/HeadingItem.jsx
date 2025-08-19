import React, { useState } from 'react';
import styles from '../../styles/CreateATPPage.module.css';

export default function HeadingItem({order, role, removeItem, register})
{
    // TODO: create the onRemove function in the parent component
    // a list of technician / engineer items should be a part of the Parent component's state [{id: 1, type: "heading"}, ...]
    // onRemove should filter the heading item from the list 
    // clicking the add heading button should add a new heading item to the list
    
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