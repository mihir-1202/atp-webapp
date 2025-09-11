import React, {useState} from 'react';
import FormHeadingBuilder from '../FormHeadingBuilder/FormHeadingBuilder';
import FormFieldBuilder from '../FormFieldBuilder/FormFieldBuilder';
import styles from './RoleFormSection.module.css';

export default function RoleFormSection({role, items, appendItem, removeItem, insertItem, register, lastClicked, setLastClicked, resetField, setValue, moveItem})
{
    const numItems = items.length;
    const formItemsJSX = items.map((item, index) => 
        {
            return (item.type === "heading") 
            ? <FormHeadingBuilder 
                key = {item.uuid} 
                role = {role} 
                removeItem = {removeItem} 
                register = {register} 
                id = {item.uuid} 
                defaultValue = {item.content || ""} 
                lastClicked = {lastClicked} 
                setLastClicked = {setLastClicked} 
                esetField = {resetField} 
                setValue = {setValue} 
                index = {index}
                imageUrl = {item.imageUrl || null} 
                imageBlobPath = {item.imageBlobPath || null} 
                numItems = {numItems}
                moveItem = {moveItem}
            /> 
            : <FormFieldBuilder 
                key = {item.uuid} 
                role = {role} 
                removeItem = {removeItem} 
                register = {register} 
                id = {item.uuid} 
                defaultValue = {item.question || ""} 
                lastClicked = {lastClicked} 
                setLastClicked = {setLastClicked} 
                resetField = {resetField} 
                setValue = {setValue} 
                index = {index}
                imageUrl = {item.imageUrl || null} 
                imageBlobPath = {item.imageBlobPath || null} 
                numItems = {numItems}
                moveItem = {moveItem}
            />
        }
    )

    //TODO: if we add a new item, we need to set the image to null (the correct value)
    function addNewItem(type)
    {
        if (lastClicked.index === null)
        {
            type === "heading" ? 
            appendItem({
                uuid: crypto.randomUUID(),
                type: type,
                content: "",
                hasImage: false,
                image: null
            })
            :
            appendItem({
                uuid: crypto.randomUUID(),
                type: type,
                question: "",
                answerFormat: "text",
                spreadsheetCell: "",
                hasImage: false,
                image: null
            })
        }

        //insert the new item at the index after the last clicked item
        else
        {
            type === "heading" ? 
            insertItem(lastClicked.index + 1, {
                uuid: crypto.randomUUID(),
                type: type,
                content: "",
                hasImage: false
            })
            :
            insertItem(lastClicked.index + 1, {
                uuid: crypto.randomUUID(),
                type: type,
                question: "",
                answerFormat: "text",
                spreadsheetCell: "",
                hasImage: false
            })
        }

    }

    return(
        <section className={role === "technician" ? styles.technicianFormSection : styles.engineerFormSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{role.charAt(0).toUpperCase() + role.slice(1)} Form</h2>
                
                <div className={styles.sectionButtons}>
                    <button className={styles.addHeadingButton} type="button" onClick = {() => addNewItem("heading")}>
                        Add Heading
                    </button>

                    <button className={styles.addFieldButton} type="button" onClick = {() => addNewItem("field")}>
                        Add New Field
                    </button>
                </div>
            </div>

            <ul className={role === "technician" ? styles.technicianFormItems : styles.engineerFormItems}>  
                {formItemsJSX}
            </ul>
        </section>
    )
}
