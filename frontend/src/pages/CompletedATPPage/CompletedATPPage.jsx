import React from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import Navbar from '../../components/Navbar/Navbar'
import ATPInputSection from '../../components/ATPInputSection/ATPInputSection'
import FormHeader from '../../components/FormHeader/FormHeader'
import styles from './CompletedATPPage.module.css'
import StatusSelector from './StatusSelector'

//Path: /completed-atp/:atpFormId/:prevSubmissionId
export default function CompletedATPPage()
{
    const navigate = useNavigate();
    const {atpFormId, prevSubmissionId} = useParams();
    const {register, handleSubmit, reset} = useForm({defaultValues: {formId: atpFormId, reviewedBy: 'engineer@upwingenergy.com'}});

    const [atpTemplateData, setATPTemplateData] = React.useState(null);
    const [prevTechnicianResponses, setPrevTechnicianResponses] = React.useState(null);
    const [prevEngineerResponses, setPrevEngineerResponses] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

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

    async function getPrevResponses(role)
    {
        if(prevSubmissionId)
        {
            try
            {
                let data = await fetch(`http://localhost:8000/atp-submissions/${prevSubmissionId}`);
                data = await data.json();
                if (role === 'technician')
                    setPrevTechnicianResponses(data.technicianResponses);
                else
                    setPrevEngineerResponses(data.engineerResponses);
            }
            
            catch(error)
            {
                console.error('Error fetching responses:', error);
                // TODO: Handle error state
            }
        }
    }

    async function loadAllData()
    {
        if (atpFormId)
        {
            await getATPTemplateData();
            await getPrevResponses('technician');
            await getPrevResponses('engineer');
            setIsLoading(false);
        }
    }

    function getAnswerFormat(role, questionOrder)
    {
        let question = atpTemplateData.sections[role].items.find(item => item.order === parseInt(questionOrder));
        return question ? question.answerFormat : null;
    }

    React.useEffect(() => {loadAllData();}, [atpFormId, prevSubmissionId]);

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!atpTemplateData) {
        return <div className={styles.loading}>Error: Could not load ATP data</div>;
    }

    return(
        <div className={styles.fillATPPage}>
            <Navbar title = {"View Completed ATP"}/>

            <FormHeader 
                title={atpTemplateData.metadata?.title} 
                description={atpTemplateData.metadata?.description} 
            />

            <div className={styles.formContainer}>
                <form className="atp-form" id="submissionForm">
                    {/* Technician Section - Read-only display of previous responses */}
                    <ATPInputSection 
                        register = {register}
                        userRole = {"technician"} 
                        atpTemplateData = {atpTemplateData} 
                        prevTechnicianResponses = {prevTechnicianResponses} 
                        showButtons = {false}
                        readOnly = {true}
                    />
                    
                    {/* Engineer Section - Editable inputs for engineer */}
                    <ATPInputSection 
                        register = {register}
                        userRole = {"engineer"} 
                        atpTemplateData = {atpTemplateData} 
                        prevEngineerResponses = {prevEngineerResponses} 
                        showButtons = {false}
                        readOnly = {true}
                    />

                    <StatusSelector register = {register} />
                </form>
            </div>
            
            <footer className={styles.footer}>
                <p>&copy; 2024 Upwing Energy. All rights reserved.</p>
            </footer>
        </div>
    )
}