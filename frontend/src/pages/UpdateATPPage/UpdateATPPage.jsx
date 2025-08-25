import React from 'react';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import Navbar from '../../components/Navbar/Navbar';

//TODO: import styles from the correct page
import styles from '../CreateATPPage/CreateATPPage.module.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useParams } from 'react-router-dom';


//Path: /update-atp/atpFormId
export default function UpdateATPPage()
{
    const {atpFormId} = useParams();
    const [atpFormData, setATPFormData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        fetch(`http://localhost:8000/atp-forms/${atpFormId}`)
        .then(response => response.json())
        .then(data => setATPFormData(data))
        .then(() => setIsLoading(false));
    }, [atpFormId]);

    function handleSubmit(formData)
    {
        fetch(`http://localhost:8000/atp-forms/${atpFormId}`, {
            method: "PUT",
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