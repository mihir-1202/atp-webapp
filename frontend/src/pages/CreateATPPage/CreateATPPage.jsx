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