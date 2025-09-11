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
    const {fields: technicianItems, append: appendTechnicianItem, remove: removeTechnicianItem, insert: insertTechnicianItem, move: moveTechnicianItem} = useFieldArray({
        control,
        name: "sections.technician.items"
    });

    const {fields: engineerItems, append: appendEngineerItem, remove: removeEngineerItem, insert: insertEngineerItem, move: moveEngineerItem} = useFieldArray({
        control,
        name: "sections.engineer.items"
    });

    // Default onSubmit function that handles UUID assignment
    function handleFormSubmit(formData) {

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
    }
    const [showRemoveExcelFileButton, setShowRemoveExcelFileButton] = useState(false);
    const [excelFileName, setExcelFileName] = React.useState(defaultMetadata.spreadsheetTemplateBlobPath);
    //custom onChange function for the spreadsheet template input
    const {onChange, ...registerWithoutDefaultOnChange} = register("spreadsheetTemplate");
    function handleExcelFileChange(e)
    {
        const file = e.target.files[0];
        setExcelFileName(file.name);
        if(location === 'update-atp')
            setShowRemoveExcelFileButton(true);
        onChange(e);
    }
    function handleExcelFileRemove()
    {
        setExcelFileName(defaultMetadata.spreadsheetTemplateBlobPath);
        if (showRemoveExcelFileButton)
            setShowRemoveExcelFileButton(false);
    }


    return(
        <main>

            <div className={styles.formContainer}>
                <h1 className={styles.formTitle}>Form Details</h1>
                <form className="atp-form" onSubmit = {handleSubmit(handleFormSubmit)}> 
                    
                    
                    
                    <FormMetadata 
                        register = {register}
                    />

                    {/* Spreadsheet template upload under Form Details, below description (above divider) */}
                    <div className={styles.fileUploadContainer}>
                        <div className={styles.fileUploadLabel}> {location === "create-atp" ? "Import ATP Excel Spreadsheet Template" : "Replace ATP Excel Spreadsheet Template"} </div>
                        <div className={styles.fileUploadRow}>
                            <span className={styles.fileButtonWrapper}>
                                <input 
                                    className={styles.fileUploadInput}
                                    type = "file" 
                                    accept=".xlsx,.xls"
                                    onChange = {handleExcelFileChange}
                                    {...registerWithoutDefaultOnChange} 
                                />
                            </span>
                            <span className={styles.fileUploadFilename}>{excelFileName}</span>
                            {showRemoveExcelFileButton && <button className={styles.removeFileButton} type = "button" onClick = {handleExcelFileRemove}>Remove</button>}
                        </div>
                    </div>

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
                        moveItem = {moveTechnicianItem}
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
                        moveItem = {moveEngineerItem}
                    />

                    <hr className="divider" />

                    
                    <CreateFormActions />
                </form>
            </div>
        </main>
    )
}
