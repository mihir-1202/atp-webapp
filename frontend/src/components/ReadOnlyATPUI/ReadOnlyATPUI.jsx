import React from 'react'
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
    const [prevTechnicianResponses, setPrevTechnicianResponses] = React.useState(null);
    const [prevEngineerResponses, setPrevEngineerResponses] = React.useState(null);
    const [completedSpreadsheetURL, setCompletedSpreadsheetURL] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {loadAllData();}, [atpFormId, prevSubmissionId]);

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
    async function getPrevResponses(role)
    {
        if(prevSubmissionId)
        {
            try
            {
                let data = await fetch(`http://localhost:8000/atp-submissions/${prevSubmissionId}`);
                data = await data.json();
                setPrevTechnicianResponses(data.technicianResponses);
                setPrevEngineerResponses(data.engineerResponses); 
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
        await getPrevResponses('technician');
        await getPrevResponses('engineer');
        setIsLoading(false);
    }

    //Get the question metadata from the atp template data
    function getQuestionMetadataByUUID(role, questionUUID)
    {
        //iterates through the items in the atpTemplateData.sections.technician.items array and returns the item which has the same uuid as the argument
        let question = atpTemplateData.sections[role].items.find(item => item.uuid === questionUUID);
        return question;
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
                        register = {() => {}}
                        role = {"technician"} 
                        atpTemplateData = {atpTemplateData} 
                        prevResponses = {prevTechnicianResponses} 
                        showFormActions = {false}
                        readOnly = {true}
                    />
                    
                    
                    <ATPInputSection 
                        register = {() => {}}
                        role = {"engineer"} 
                        atpTemplateData = {atpTemplateData} 
                        prevResponses = {prevEngineerResponses}
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