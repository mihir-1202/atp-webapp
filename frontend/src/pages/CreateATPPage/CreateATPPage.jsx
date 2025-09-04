import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import Navbar from '../../components/Navbar/Navbar';
import styles from './CreateATPPage.module.css';


//Path: /create-atp
export default function CreateATPPage()
{
    const navigate = useNavigate();
    const defaultMetadata = {
        title: "this is not a test title",
        description: "this is not a test description",
        createdBy: "someone@upwingenergy.com"
    }
    
    const defaultTechnicianItems = [
        {
            uuid: crypto.randomUUID(),
            type: "heading",
            content: "This is a technician heading",
            image: null
        },

        {
            uuid: crypto.randomUUID(),
            type: "field",
            question: "This is a technician question",
            answerFormat: "text",
            spreadsheetCell: "A2",
            image: null
        }
    ]

    const defaultEngineerItems = [
        {
            uuid: crypto.randomUUID(),
            type: "heading",
            content: "This is not a engineer heading",
            image: null
        },

        {
            uuid: crypto.randomUUID(),
            type: "field",
            question: "This is a engineer question",
            answerFormat: "text",
            spreadsheetCell: "B2",
            image: null
        }
    ]



    function handleSubmit(formData)
    {
        const isValidURL = (string) => {
            try{
                new URL(string);
                return true;
            }
            catch(error){
                return false;
            }
        }
        
        const processedFormData = new FormData();
        
        /*
        react hook formData: values are objects (need to JSON.stringify the body before sending http request)
        browser formData: values must be strings (use JSON.stringify to convert from react form data)
        */
        const spreadsheetTemplate = formData.spreadsheetTemplate[0];
        if (!spreadsheetTemplate)
        {
            alert("Please select an Excel file to upload");
            return;
        }

        const sectionsWithoutImages = {
            technician: {
                items: formData.sections.technician.items.map((item) => {
                    const {image, ...rest} = item;
                    
                    // Check if image is valid (File object or valid URL)
                    const hasValidImage = (image instanceof File || isValidURL(image));
                    
                    if (hasValidImage) 
                    {
                        if (image instanceof File)
                        {
                            processedFormData.append('technicianUploadedImages', image);
                            processedFormData.append('technicianUploadedImageUUIDs', item.uuid);
                        }

                        else
                        {
                            processedFormData.append('technicianRemoteImagePaths', image);
                            processedFormData.append('technicianRemoteImageUUIDs', item.uuid);
                        }
                    }
                    
                    return {...rest}
                }),
            },

            engineer: {
                items: formData.sections.engineer.items.map((item) => {
                    const {image, ...rest} = item;
                    
                    // Check if image is valid (File object or valid URL)
                    const hasValidImage = (image instanceof File || isValidURL(image));
                    
                    if (hasValidImage) 
                    {
                        if (image instanceof File)
                        {
                            processedFormData.append('engineerUploadedImages', image);
                            processedFormData.append('engineerUploadedImageUUIDs', item.uuid);
                        }

                        else
                        {
                            processedFormData.append('engineerRemoteImagePaths', image);
                            processedFormData.append('engineerRemoteImageUUIDs', item.uuid);
                        }
                    }
                    
                    return {...rest}
                })
            }
        }
        
        // Create FormData for file upload
        processedFormData.append('spreadsheetTemplate', spreadsheetTemplate);  // Parameter name must match backend expectation
        
        // Add other form fields to FormData
        processedFormData.append('metadata', JSON.stringify(formData.metadata));
        processedFormData.append('sections', JSON.stringify(sectionsWithoutImages));
        
        for (const [key, value] of processedFormData.entries())
        {
            console.log(key, value);
        }

        
        
        fetch("http://localhost:8000/atp-forms/", {
            method: "POST",
            body: processedFormData
        })
        .then(async response => {
            if (response.ok) 
                return response.json();
            else {
                const errorData = await response.json();
                throw new Error(errorData.errors);
            }
        })
        .then(data => {
            console.log("Backend response:", data);
            alert("Successfully created form template!");
            navigate('/');
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
        });
        
    };

    return(
        <div className={styles.createATPPage}>
            <Navbar title = {"Create ATP"}/>
            <FormBuilder 
                defaultMetadata = {defaultMetadata} 
                defaultTechnicianItems = {defaultTechnicianItems} 
                defaultEngineerItems = {defaultEngineerItems}
                onSubmit = {handleSubmit}
            />
        </div>
    )
}