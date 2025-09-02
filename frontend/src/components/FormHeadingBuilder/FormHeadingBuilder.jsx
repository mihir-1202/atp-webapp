import React, { useState, useRef } from 'react';
import styles from './FormHeadingBuilder.module.css';
import ImageInput from '../ImageInput';

export default function FormHeadingBuilder({index, role, removeItem, defaultValue = "", register, setLastClicked, resetField, setValue, imageUrl = null, imageBlobPath = null})
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
