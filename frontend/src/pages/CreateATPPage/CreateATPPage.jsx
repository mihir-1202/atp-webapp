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
            order: 0,
            type: "heading",
            content: "This is a technician heading",
        },

        {
            uuid: crypto.randomUUID(),
            order: 1,
            type: "field",
            question: "This is a technician question",
            answerFormat: "text",
            spreadsheetCell: "A2"
        }
    ]

    const defaultEngineerItems = [
        {
            uuid: crypto.randomUUID(),
            order: 0,
            type: "heading",
            content: "This is not a engineer heading",
        },

        {
            uuid: crypto.randomUUID(),
            order: 1,
            type: "field",
            question: "This is a engineer question",
            answerFormat: "text",
            spreadsheetCell: "B2"
        }
    ]



    function handleSubmit(formData)
    {
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
        
        // Create FormData for file upload
        const processedFormData = new FormData();
        processedFormData.append('spreadsheetTemplate', spreadsheetTemplate);  // Parameter name must match backend expectation
        
        // Add other form fields to FormData
        processedFormData.append('metadata', JSON.stringify(formData.metadata));
        processedFormData.append('sections', JSON.stringify(formData.sections));

        
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