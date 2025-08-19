import React, {useState} from 'react';
import FormHeadingBuilder from './FormHeadingBuilder';
import FormFieldBuilder from './FormFieldBuilder';
import styles from './RoleFormSection.module.css';

export default function RoleFormSection({role, items, appendItem, removeItem, register})
{
    
    const [formItemId, setFormItemId] = useState(1);
    const [formItems, setFormItems] = useState([]);

    function addFormItem(type)
    {
        setFormItems([...formItems, {id: formItemId, type: type}]);
        setFormItemId(formItemId + 1);
    }

    function removeFormItem(id)
    {
        setFormItems(formItems.filter((item) => item.id !== id));
    }
 
    let formItemsJSX = items.map((item, index) => 
        {
            return (item.type === "heading") 
            ? <FormHeadingBuilder key = {item.id} order = {index} role = {role} removeItem = {removeItem} register = {register} /> 
            : <FormFieldBuilder key = {item.id} order = {index} role = {role} removeItem = {removeItem} register = {register} />
        }
    )

    return(
        <section className={role === "technician" ? styles.technicianFormSection : styles.engineerFormSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{role.charAt(0).toUpperCase() + role.slice(1)} Form</h2>
                
                <div className={styles.sectionButtons}>
                    <button className={styles.addHeadingButton} type="button" onClick = {() => appendItem({order: items.length, type: "heading", content: ""})}>
                        Add Heading
                    </button>

                    <button className={styles.addFieldButton} type="button" onClick = {() => appendItem({order: items.length, type: "field", question: "", answerFormat: "text"})}>
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
