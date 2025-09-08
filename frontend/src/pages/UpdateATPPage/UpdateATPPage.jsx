import React from 'react';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import Navbar from '../../components/Navbar/Navbar';

//TODO: import styles from the correct page
import styles from '../CreateATPPage/CreateATPPage.module.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../auth/UserProvider';
import UnauthorizedUI from '../../components/UnauthorizedUI/UnauthorizedUI.jsx';

//TODO: fix the path to the update ATP page
//Path: /update-atp/atpFormGroupId
export default function UpdateATPPage()
{
    const user = useContext(UserContext);
    if (user.userRole !== 'admin')
    {
        return <UnauthorizedUI message='You are not authorized to update ATPs' />;
    }
    
    const {atpFormGroupId} = useParams();
    const [atpFormData, setATPFormData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const navigate = useNavigate();

    React.useEffect(() => {
        async function fetchData()
        {
            const response = await fetch(`http://localhost:8000/atp-forms/active/${atpFormGroupId}`);
            const data = await response.json();
            if (!response.ok) 
            {
                console.error('Error fetching ATP form data:', data?.message);
                setIsLoading(false);
                alert(data?.message || 'Failed to fetch ATP form data');
                navigate('/');
            }
            else
            {
                console.log(data);
                setATPFormData(data);
                setIsLoading(false);
            }
           
        }
      
        fetchData();
      }, [atpFormGroupId]);

    function handleSubmit(formData)
    {
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
                            // Ensure hasImage is true for new images
                            rest.hasImage = true;
                        }
                        else
                        {
                            processedFormData.append('technicianRemoteImagePaths', image);
                            processedFormData.append('technicianRemoteImageUUIDs', item.uuid);
                            // Ensure hasImage is true for existing images too
                            rest.hasImage = true;
                        }
                    }
                    else
                    {
                        // Image was removed or never existed
                        rest.hasImage = false;
                    }
                    
                    return rest
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
                            // Ensure hasImage is true for new images
                            rest.hasImage = true;
                        }
                        else
                        {
                            processedFormData.append('engineerRemoteImagePaths', image);
                            processedFormData.append('engineerRemoteImageUUIDs', item.uuid);
                            // Ensure hasImage is true for existing images too
                            rest.hasImage = true;
                        }
                    }
                    else
                    {
                        // Image was removed or never existed
                        rest.hasImage = false;
                    }
                    
                    return rest
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

        updateATP(processedFormData, atpFormGroupId, navigate);
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

async function updateATP(processedFormData, atpFormGroupId, navigate)
{
    const response = await fetch(`http://localhost:8000/atp-forms/active/${atpFormGroupId}`, {
        method: "PUT",
        body: processedFormData
    })

    const data = await response.json();
    if (!response.ok)
        alert(data?.message || 'Failed to update form template');

    else
    {
        console.log(data);
        alert('Form template updated successfully!');
        navigate('/');
    }

    return data;
}