import React from 'react'
import { useForm } from 'react-hook-form';
import {useParams} from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import ATPInputSection from '../../components/ATPInputSection/ATPInputSection'
import FormHeader from '../../components/FormHeader/FormHeader'
import styles from './ReadOnlyATPUI.module.css'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'

//Path: /review-atp/:atpFormGroupId/:prevSubmissionId

//TODO: avoid repeated logic in this page (ReviewATPPage) and FillATPPage
export default function ReadOnlyATPUI()
{
    const {atpFormId, prevSubmissionId} = useParams();
    const [atpTemplateData, setATPTemplateData] = React.useState(null);

    const [submissionData, setSubmissionData] = React.useState(null);
    const [completedSpreadsheetURL, setCompletedSpreadsheetURL] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    //don't need to set default values for any fields because we aren't submitting it to the backend, we are only reading it
    const defaultValues = {}
    const {register, handleSubmit, reset, setValue} = useForm(defaultValues);

    React.useEffect(() => {loadAllData();}, [atpFormId, prevSubmissionId]);

    //atpTemplateData becomes available -> setAtpTemplateData() is called -> re-render the component -> useEffect runs and resets the form
    /*
    CANNOT do await getATPTemplateData(); await getSubmissionData(); 
    because the re-render is triggered onlyafter the component function is fully executed/rendered -> setSubmissionData(null) -> setSubmissionData won't be called again after re-render
    */
    React.useEffect(() => {
        if (atpTemplateData && prevSubmissionId && submissionData) {
            console.log('resetting form with template data');
            
            // Transform technicianResponses to the format that the form works with (see onSubmit function for more details)
            const technicianResponsesFormatted = {};
            if (submissionData.technicianResponses) {
                submissionData.technicianResponses.forEach(response => {
                    technicianResponsesFormatted[response.questionUUID] = {
                        response: response.answer,
                        lastEdited: response.lastEdited
                    };
                });
            }
            
            // Transform engineerResponses to the format that the form works with
            const engineerResponsesFormatted = {};
            if (submissionData.engineerResponses) {
                submissionData.engineerResponses.forEach(response => {
                    engineerResponsesFormatted[response.questionUUID] = {
                        response: response.answer,
                        lastEdited: response.lastEdited
                    };
                });
            }
            
            //reset the default form values when the data from the api is ready
            reset({
                //only values needed to be reset are the previous repsonses -> don't need to reset the other values since we are only reading the completed form, not submitting a new form
                technicianResponses: technicianResponsesFormatted,
                engineerResponses: engineerResponsesFormatted
            }); 
        }
    }, [atpTemplateData, prevSubmissionId, submissionData]);

    //Get the atp template data from the database
    async function getATPTemplateData()
    {
        try {
            let data = await fetch(`http://localhost:8000/atp-forms/${atpFormId}`);
            data = await data.json();
            console.log(data);
            setATPTemplateData(data);

        }
        catch(error) {
            console.error('Error fetching form data:', error);
        }
    }

    //Get the previous responses from the database
    async function getPrevResponses()
    {
        if(prevSubmissionId)
        {
            try
            {
                let data = await fetch(`http://localhost:8000/atp-submissions/${prevSubmissionId}`);
                data = await data.json();
                setSubmissionData(data);
                setCompletedSpreadsheetURL(data.completedSpreadsheetURL);
            }
            
            catch(error)
            {
                console.error('Error fetching responses:', error);
                // TODO: Handle error state
            }
        }
    }

    //Load all the data from the database
    async function loadAllData()
    {
        await getATPTemplateData();
        await getPrevResponses();
        setIsLoading(false);
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!atpTemplateData) {
        return <LoadingSpinner />
    }

    return(
        <div className={styles.fillATPPage}>
            <Navbar title = {'View Completed ATP'}/>

            <FormHeader 
                title={atpTemplateData.metadata?.title} 
                description={atpTemplateData.metadata?.description} 
            />

            <div className={styles.formContainer}>
                <form className="atp-form" id="submissionForm" onSubmit={() => {}}>
            
                    <ATPInputSection 
                        register = {register}
                        role = {"technician"} 
                        atpTemplateData = {atpTemplateData} 
                        prevResponses = {submissionData?.technicianResponses} 
                        showFormActions = {false}
                        readOnly = {true}
                    />
                    
                    
                    <ATPInputSection 
                        register = {register}
                        role = {"engineer"} 
                        atpTemplateData = {atpTemplateData} 
                        prevResponses = {submissionData?.engineerResponses}
                        setValue = {setValue}
                        showFormActions = {false}
                        readOnly = {true}
                        completedSpreadsheetURL = {completedSpreadsheetURL}
                    />
                    
                </form>
            </div>
            
            <footer className={styles.footer}>
                <p>&copy; 2024 Upwing Energy. All rights reserved.</p>
            </footer>
        </div>
    )
}