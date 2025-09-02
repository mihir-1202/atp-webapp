import React, {useState} from 'react';
import FormHeadingBuilder from '../FormHeadingBuilder/FormHeadingBuilder';
import FormFieldBuilder from '../FormFieldBuilder/FormFieldBuilder';
import styles from './RoleFormSection.module.css';

export default function RoleFormSection({role, items, appendItem, removeItem, insertItem, register, lastClicked, setLastClicked, resetField, setValue})
{
    const formItemsJSX = items.map((item, index) => 
        {
            console.log(item);
            return (item.type === "heading") 
            ? <FormHeadingBuilder 
                key = {item.uuid} 
                index = {index} 
                role = {role} 
                removeItem = {removeItem} 
                register = {register} 
                id = {item.uuid} 
                defaultValue = {item.content || ""} 
                lastClicked = {lastClicked} 
                setLastClicked = {setLastClicked} r
                esetField = {resetField} 
                setValue = {setValue} 
                imageUrl = {item.imageUrl || null} 
                imageBlobPath = {item.imageBlobPath || null} 
            /> 
            : <FormFieldBuilder 
                key = {item.uuid} 
                index = {index} 
                role = {role} 
                removeItem = {removeItem} 
                register = {register} 
                id = {item.uuid} 
                defaultValue = {item.question || ""} 
                lastClicked = {lastClicked} 
                setLastClicked = {setLastClicked} 
                resetField = {resetField} 
                setValue = {setValue} 
                imageUrl = {item.imageUrl || null} 
                imageBlobPath = {item.imageBlobPath || null} 
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
                index: items.length,
                type: type,
                content: "",
                hasImage: false,
                image: null
            })
            :
            appendItem({
                uuid: crypto.randomUUID(),
                index: items.length,
                type: type,
                question: "",
                answerFormat: "text",
                spreadsheetCell: "",
                hasImage: false,
                image: null
            })
        }

        else
        {
            type === "heading" ? 
            insertItem(lastClicked.index + 1, {
                uuid: crypto.randomUUID(),
                index: lastClicked.index,
                type: type,
                content: "",
                hasImage: false
            })
            :
            insertItem(lastClicked.index + 1, {
                uuid: crypto.randomUUID(),
                index: lastClicked.index,
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
