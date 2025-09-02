import React from 'react';
import { useState } from 'react';
import FormMetadata from '../FormMetadata/FormMetadata';
import RoleFormSection from '../RoleFormSection/RoleFormSection';
import CreateFormActions from '../CreateFormActions/CreateFormActions';
import {useForm, useFieldArray} from 'react-hook-form';
import {useLocation} from 'react-router-dom';
import styles from './FormBuilder.module.css';

export default function FormBuilder({defaultMetadata, defaultTechnicianItems, defaultEngineerItems, onSubmit})
{
    const location = useLocation().pathname.split('/')[1];

    const [lastClicked, setLastClicked] = useState({index: null, role: null});
    
    const {register, control, handleSubmit, resetField, setValue} = useForm(
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

    /*
    fields represents the current state of the array
    append, remove, and insert are used to manipulate the array
    */
    const {fields: technicianItems, append: appendTechnicianItem, remove: removeTechnicianItem, insert: insertTechnicianItem} = useFieldArray({
        control,
        name: "sections.technician.items"
    });

    const {fields: engineerItems, append: appendEngineerItem, remove: removeEngineerItem, insert: insertEngineerItem} = useFieldArray({
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

            <div className={styles.formContainer}>
                <h1 className={styles.formTitle}>{location === "create-atp" ? "Create New ATP Form" : "Update ATP Form"}</h1>
                <form className="atp-form" onSubmit = {handleSubmit(handleFormSubmit)}> 
                    
                    <label style = {{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "20px"}}>
                        <input 
                            type = "file" 
                            accept=".xlsx,.xls"
                            {...register("spreadsheetTemplate")}
                        />
                        <span>{location === "create-atp" ? "Import ATP Excel Spreadsheet Template" : "Replace ATP Excel Spreadsheet Template"}</span>
                    </label>
                    
                    <FormMetadata register = {register}/>

                    <hr className="divider" />

                    <RoleFormSection 
                        role = "technician" 
                        items = {technicianItems} 
                        appendItem = {appendTechnicianItem} 
                        removeItem = {removeTechnicianItem} 
                        insertItem = {insertTechnicianItem}
                        register = {register}
                        lastClicked = {lastClicked}
                        setLastClicked = {setLastClicked}
                        resetField = {resetField}
                        setValue = {setValue}
                    />

                    <hr className="divider" />

                    <RoleFormSection 
                        role = "engineer" 
                        items = {engineerItems} 
                        appendItem = {appendEngineerItem} 
                        removeItem = {removeEngineerItem} 
                        insertItem = {insertEngineerItem}
                        register = {register}
                        lastClicked = {lastClicked}
                        setLastClicked = {setLastClicked}
                        resetField = {resetField}
                        setValue = {setValue}
                    />

                    <hr className="divider" />

                    
                    <CreateFormActions />
                </form>
            </div>
        </main>
    )
}
