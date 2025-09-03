import React from 'react';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import Navbar from '../../components/Navbar/Navbar';

//TODO: import styles from the correct page
import styles from '../CreateATPPage/CreateATPPage.module.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useParams } from 'react-router-dom';

//TODO: fix the path to the update ATP page
//Path: /update-atp/atpFormGroupId
export default function UpdateATPPage()
{
    const {atpFormGroupId} = useParams();
    const [atpFormData, setATPFormData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        fetch(`http://localhost:8000/atp-forms/active/${atpFormGroupId}`)
        .then(response => response.json())
        .then(data => setATPFormData(data))
        .then(() => setIsLoading(false));
    }, [atpFormGroupId]);

    function handleSubmit(formData)
    {
        const isValidBlobPath = (string) => {
            try{
                new URL(string);
                return true;
            }
            catch(error){
                return false;
            }
        }

        const processedFormData = new FormData();

        const sectionsWithoutImages = {
            technician: {
                items: formData.sections.technician.items.map((item) => {
                    const {image, ...rest} = item;
                    
                    //if the image is File object (local upload) or a string (blob path that hasn't been changed since last form update)
                    const hasValidImage = (image instanceof File || typeof image === 'string');

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
                })
            },

            engineer: {
                items: formData.sections.engineer.items.map((item) => {
                    const {image, ...rest} = item;
                    const hasValidImage = (image instanceof File || typeof image === 'string');

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
            },
        }

        /*
        -The frontend adds the 'image' and 'hasImage' fields to each section item
        -Before the API call, the 'image' field of each section item is removed from the item, and the backend is responsible for
        adding the 'image' field back to the item after uploading the image to Azure Blob Storage and getting the remote image path
        */
        
        
        
        
        //Set spreadsheetTemplate to an empty string if not provided -> if we set it to null, it's value will be converted to the string 'null' on the backend due to Form Data
        const spreadsheetTemplate = formData.spreadsheetTemplate[0] ? formData.spreadsheetTemplate[0] : '';
        
        processedFormData.append('spreadsheetTemplate', spreadsheetTemplate);
        processedFormData.append('metadata', JSON.stringify(formData.metadata));
        processedFormData.append('sections', JSON.stringify(sectionsWithoutImages));

        for (const [key, value] of processedFormData.entries())
        {
            console.log(key, value);
        }

        fetch(`http://localhost:8000/atp-forms/active/${atpFormGroupId}`, {
            method: "PUT",
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
            alert("Successfully updated form template!");
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
        });
    };

    if (isLoading)
        return <LoadingSpinner />;

    return(
        <div className={styles.createATPPage}>
            <Navbar title = {"Update ATP"}/>
            <FormBuilder 
                defaultMetadata = {atpFormData.metadata}
                defaultTechnicianItems = {atpFormData.sections.technician.items} 
                defaultEngineerItems = {atpFormData.sections.engineer.items}
                onSubmit = {handleSubmit}
            />
        </div>
    )
}