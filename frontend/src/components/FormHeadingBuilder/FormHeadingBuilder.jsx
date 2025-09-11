import React, { useState, useRef } from 'react';
import styles from './FormHeadingBuilder.module.css';
import ImageInput from '../ImageInput';

export default function FormHeadingBuilder({index, role, removeItem, defaultValue = "", register, setLastClicked, resetField, setValue, moveItem, numItems, imageUrl = null, imageBlobPath = null})
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
        <li className={styles.headingItem} data-role={role} onClick = {handleClick}>
            <div className={styles.itemBoxHeader}>
                <h3>Heading</h3>
                <div className={styles.headerActions}>
                    <button className={styles.moveButton} type = "button" onClick = {handleMoveUp}>↑</button>
                    <button className={styles.moveButton} type = "button" onClick = {handleMoveDown}>↓</button>
                    <button className={styles.removeItemButton} type="button" onClick = {() => removeItem(index)}>−</button>
                </div>
            </div>

            <div className={styles.headingInputContainer}>
                <div className={styles.inputGroup} id="heading-text-group">
                    <label htmlFor={`${role}-heading-${index}`} className={styles.inputLabel}>Heading Text</label>
                    <textarea 
                        id={`${role}-heading-${index}`} 
                        placeholder="Enter Heading" 
                        defaultValue={defaultValue}
                        required 
                        {...register(`sections.${role}.items.${index}.content`)}
                    >
                    </textarea>
                </div>
                
                <div className={styles.inputGroup} id="heading-type-group">
                    <label htmlFor = {`${role}-heading-type-${index}`} className={styles.inputLabel}>Heading Type</label>
                    <select id = {`${role}-heading-type-${index}`} 
                    defaultValue=""
                    required
                    {...register(`sections.${role}.items.${index}.headingType`)}>
                        <option value = "h1">H1</option>
                        <option value = "h2">H2</option>
                        <option value = "h3">H3</option>
                        <option value = "h4">H4</option>
                        <option value = "h5">H5</option>
                        <option value = "h6">H6</option>
                    </select>
                </div>
            </div>

            <ImageInput
                id={`${role}-heading-image-${index}`}
                label="Heading Image"
                role={role}
                index={index}
                register={register}
                resetField={resetField}
                setValue={setValue}
                imageUrl={imageUrl}
                imageBlobPath={imageBlobPath}
            />    
        </li>
    )
}
