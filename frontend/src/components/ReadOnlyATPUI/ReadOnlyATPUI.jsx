import React from 'react'
import { useForm } from 'react-hook-form';
import {useParams, useNavigate} from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import ATPInputSection from '../../components/ATPInputSection/ATPInputSection'
import FormHeader from '../../components/FormHeader/FormHeader'
import styles from './ReadOnlyATPUI.module.css'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//Path: /review-atp/:atpFormGroupId/:prevSubmissionId

//TODO: avoid repeated logic in this page (ReviewATPPage) and FillATPPage
export default function ReadOnlyATPUI()
{
    //don't need to set default values for any fields because we aren't submitting it to the backend, we are only reading it
    const defaultValues = {}
    const {register, reset, setValue} = useForm(defaultValues);
    
    const {atpFormId, prevSubmissionId} = useParams();
    const navigate = useNavigate();
    const [atpTemplateData, setATPTemplateData] = React.useState(null);
    const [submissionData, setSubmissionData] = React.useState(null);
    const [completedSpreadsheetURL, setCompletedSpreadsheetURL] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);


    React.useEffect(() => {loadAllData();}, [atpFormId, prevSubmissionId]);

    //atpTemplateData becomes available -> setAtpTemplateData() is called -> re-render the component -> useEffect runs and resets the form
    /*
    CANNOT do await getATPTemplateData(); await getSubmissionData(); 
    because the re-render is triggered onlyafter the component function is fully executed/rendered -> setSubmissionData(null) -> setSubmissionData won't be called again after re-render
    */
    React.useEffect(() => {
        if (atpTemplateData && prevSubmissionId && submissionData) {
            
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
        const response = await fetch(`${API_BASE_URL}/atp-forms/${atpFormId}`);
        
        const data = await response.json();
        if (!response.ok) 
        {
            console.error('Error fetching form template data:', data?.message);
            alert(data?.message);
            navigate('/');
            return;
        }
        
        setATPTemplateData(data);
    }

    //Get the previous responses from the database
    async function getPrevResponses()
    {
        if(prevSubmissionId)
        {
           
            const response = await fetch(`${API_BASE_URL}/atp-submissions/${prevSubmissionId}`);
            const data = await response.json();
            if (!response.ok) 
            {
                console.error('Error fetching previous responses:', data?.message);
                alert(data?.message);
                navigate('/');
                return;
            }
            
            setSubmissionData(data);
            setCompletedSpreadsheetURL(data.completedSpreadsheetURL);
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
            
            
        </div>
    )
}