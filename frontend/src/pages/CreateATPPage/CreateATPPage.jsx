import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import Navbar from '../../components/Navbar/Navbar';
import styles from './CreateATPPage.module.css';
import { useContext } from 'react';
import { UserContext } from '../../auth/UserProvider';
import UnauthorizedUI from '../../components/UnauthorizedUI/UnauthorizedUI.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


//Path: /create-atp
export default function CreateATPPage()
{
    
    const navigate = useNavigate();
    const user = useContext(UserContext);
    if (user.userRole !== 'admin')
    {
        return <UnauthorizedUI message='You are not authorized to create ATPs' />;
    }

    console.log('User:', user);
    
    
    const defaultMetadata = {
        title: "",
        description: "",
        createdBy: user.userEmail
    }
    
    const defaultTechnicianItems = [
        {
            uuid: crypto.randomUUID(),
            type: "heading",
            headingType: "",
            content: "",
            image: null
        },

        {
            uuid: crypto.randomUUID(),
            type: "field",
            question: "",
            answerFormat: "",
            spreadsheetCell: "",
            image: null
        }
    ]

    const defaultEngineerItems = [
        {
            uuid: crypto.randomUUID(),
            type: "heading",
            headingType: "",
            content: "",
            image: null
        },

        {
            uuid: crypto.randomUUID(),
            type: "field",
            question: "",
            answerFormat: "",
            spreadsheetCell: "",
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
            //if we are creating an atp form for the first time, an excel file is required
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

        createATP(processedFormData, navigate);
        
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


async function createATP(processedFormData, navigate)
{
    const response = await fetch(`${API_BASE_URL}/atp-forms/`, {
        method: "POST",
        body: processedFormData
    })
    const data = await response.json();
    if (!response.ok)
        alert(data?.message || 'Failed to create form template');
    else
    {
        console.log("Backend response:", data);
        alert("Successfully created form template!");
        navigate('/');
    }

}