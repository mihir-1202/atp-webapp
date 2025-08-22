import React from 'react';
import FormMetadata from './FormMetadata';
import RoleFormSection from './RoleFormSection';
import FormActions from './FormActions';
import {useForm, useFieldArray} from 'react-hook-form';
import styles from './FormBuilder.module.css';

export default function FormBuilder()
{
    const {register, control, handleSubmit} = useForm(
        {
            defaultValues:
            {
                metadata:
                {
                    title: "this is a test title",
                    description: "this is a test description",
                    createdBy: "someone@upwingenergy.com"
                },

                sections:
                {
                    technician:
                    {
                        items: 
                        [
                            {
                                order: 0,
                                type: "heading",
                                content: "This is a technician heading",
                                spreadsheetCell: "A1"
                            },

                            {
                                order: 1,
                                type: "field",
                                question: "This is a technician question",
                                answerFormat: "text",
                                spreadsheetCell: "A2"
                            }
                        ]
                    },

                    engineer:
                    {
                        items: 
                        [
                            {
                                order: 0,
                                type: "heading",
                                content: "This is a engineer heading",
                                spreadsheetCell: "B1"
                            },

                            {
                                order: 1,
                                type: "field",
                                question: "This is a engineer question",
                                answerFormat: "text",
                                spreadsheetCell: "B2"
                            }
                        ]
                    }
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

    function onSubmit(formData) 
    {
        console.log("Frontend sending:", formData);
      
        fetch("http://localhost:8000/atp-forms/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        })
        .then(async response => {
          if (response.ok) 
            return response.json();
          else 
          {
            const errorData = await response.json();
            throw new Error(errorData.errors);
          }
        })
        .then(data => {
          console.log("Backend response:", data);
          alert("Successfully created form template!");
        })
        .catch(error => {
          alert(`Error: ${error.message}`);
        });
    }
      

    return(
        <main>
            <label style = {{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "20px"}}>
                <input type = "file" />
                {/* will not get submitted with the form because it is not wrapped in the form element */}
                <span>Upload ATP Excel Spreadsheet Template</span>
            </label>

            <div className={styles.formContainer}>
                <h1 className={styles.formTitle}>Create New ATP Form</h1>
                <form className="atp-form" onSubmit = {handleSubmit(onSubmit)}> 
                    <FormMetadata register = {register}/>

                    <hr className="divider" />

                    <RoleFormSection role = "technician" items = {technicianItems} appendItem = {appendTechnicianItem} removeItem = {removeTechnicianItem} register = {register}/>

                    <hr className="divider" />

                    <RoleFormSection role = "engineer" items = {engineerItems} appendItem = {appendEngineerItem} removeItem = {removeEngineerItem} register = {register}/>

                    <hr className="divider" />

                    
                    <FormActions />
                </form>
            </div>
        </main>
    )
}
