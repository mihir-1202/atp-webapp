import React from 'react';
import FormMetadata from './FormMetadata';
import RoleFormSection from './RoleFormSection';
import FormActions from './FormActions';
import {useForm, useFieldArray} from 'react-hook-form';

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
                                content: "This is a technician heading"
                            },

                            {
                                order: 1,
                                type: "field",
                                question: "This is a technician question",
                                answerFormat: "text"
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
                                content: "This is a engineer heading"
                            },

                            {
                                order: 1,
                                type: "field",
                                question: "This is a engineer question",
                                answerFormat: "text"
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
      
        fetch("http://localhost:8000/form-templates", {
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
            <div className = "form-container">
                <h1>Create New ATP Form</h1>
                <form className = "atp-form" onSubmit = {handleSubmit(onSubmit)}> 
                    <FormMetadata register = {register}/>

                    <hr className = "divider" />

                    <RoleFormSection role = "technician" items = {technicianItems} appendItem = {appendTechnicianItem} removeItem = {removeTechnicianItem} register = {register}/>

                    <hr className = "divider" />

                    <RoleFormSection role = "engineer" items = {engineerItems} appendItem = {appendEngineerItem} removeItem = {removeEngineerItem} register = {register}/>

                    <hr className = "divider" />

                    
                    <FormActions />
                </form>
            </div>
        </main>
    )
}
