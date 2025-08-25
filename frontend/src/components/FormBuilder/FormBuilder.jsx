import React from 'react';
import FormMetadata from '../FormMetadata/FormMetadata';
import RoleFormSection from '../RoleFormSection/RoleFormSection';
import CreateFormActions from '../CreateFormActions/CreateFormActions';
import {useForm, useFieldArray} from 'react-hook-form';
import styles from './FormBuilder.module.css';

export default function FormBuilder({defaultMetadata, defaultTechnicianItems, defaultEngineerItems, onSubmit})
{
    const {register, control, handleSubmit} = useForm(
        {
            defaultValues:
            {
                metadata: defaultMetadata,

                sections:
                {
                    technician: {items: defaultTechnicianItems},
                    engineer: {items: defaultEngineerItems}
                }
            }
        }
    );

    const {fields: technicianItems, append: appendTechnicianItem, remove: removeTechnicianItem} = useFieldArray({
        control,
        name: "sections.technician.items"
    });

    const {fields: engineerItems, append: appendEngineerItem, remove: removeEngineerItem} = useFieldArray({
        control,
        name: "sections.engineer.items"
    });

    // Default onSubmit function that handles UUID assignment
    const handleFormSubmit = (formData) => {
        console.log("Frontend sending:", formData);

        // Use the UUIDs from useFieldArray fields (they contain the uuid property)
        formData.sections.technician.items.forEach((item, index) => {
            // Get the uuid from the technicianItems array from useFieldArray
            item.uuid = technicianItems[index].uuid;
        });

        formData.sections.engineer.items.forEach((item, index) => {
            // Get the uuid from the engineerItems array from useFieldArray
            item.uuid = engineerItems[index].uuid;
        });

        // Call the provided onSubmit function or use default
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    return(
        <main>
            <label style = {{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "20px"}}>
                <input type = "file" />
                {/* will not get submitted with the form because it is not wrapped in the form element */}
                <span>Upload ATP Excel Spreadsheet Template</span>
            </label>

            <div className={styles.formContainer}>
                <h1 className={styles.formTitle}>Create New ATP Form</h1>
                <form className="atp-form" onSubmit = {handleSubmit(handleFormSubmit)}> 
                    <FormMetadata register = {register}/>

                    <hr className="divider" />

                    <RoleFormSection role = "technician" items = {technicianItems} appendItem = {appendTechnicianItem} removeItem = {removeTechnicianItem} register = {register}/>

                    <hr className="divider" />

                    <RoleFormSection role = "engineer" items = {engineerItems} appendItem = {appendEngineerItem} removeItem = {removeEngineerItem} register = {register}/>

                    <hr className="divider" />

                    
                    <CreateFormActions />
                </form>
            </div>
        </main>
    )
}
