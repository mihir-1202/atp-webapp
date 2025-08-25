import React, {useState} from 'react';
import FormHeadingBuilder from '../FormHeadingBuilder/FormHeadingBuilder';
import FormFieldBuilder from '../FormFieldBuilder/FormFieldBuilder';
import styles from './RoleFormSection.module.css';

export default function RoleFormSection({role, items, appendItem, removeItem, register})
{
 
    let formItemsJSX = items.map((item, index) => 
        {
            return (item.type === "heading") 
            ? <FormHeadingBuilder key = {item.uuid} order = {index} role = {role} removeItem = {removeItem} register = {register} id = {item.uuid} defaultValue = {item.content || ""} /> 
            : <FormFieldBuilder key = {item.uuid} order = {index} role = {role} removeItem = {removeItem} register = {register} id = {item.uuid} defaultValue = {item.question || ""} />
        }
    )

    return(
        <section className={role === "technician" ? styles.technicianFormSection : styles.engineerFormSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{role.charAt(0).toUpperCase() + role.slice(1)} Form</h2>
                
                <div className={styles.sectionButtons}>
                    <button className={styles.addHeadingButton} type="button" onClick = {() => appendItem({
                        uuid: crypto.randomUUID(),
                        order: items.length, 
                        type: "heading", 
                        content: "",
                    })}>
                        Add Heading
                    </button>

                    <button className={styles.addFieldButton} type="button" onClick = {() => appendItem({
                        uuid: crypto.randomUUID(),
                        order: items.length, 
                        type: "field", 
                        question: "", 
                        answerFormat: "text",
                        spreadsheetCell: ""
                    })}>
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
