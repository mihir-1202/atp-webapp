import React from 'react'
import {useParams} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import Navbar from '../components/ATPFormComponents/Navbar'
import ATPInputSection from '../components/ATPFormComponents/ATPInputSection'
import FormHeader from '../components/ATPFormComponents/FormHeader'
import styles from '../styles/FillATPPage.module.css'

//Path: /review-atp/:atpFormId/:prevSubmissionId
export default function ReviewATPPage()
{
    const {atpFormId, prevSubmissionId} = useParams();
    const {register, handleSubmit} = useForm({defaultValues: {formId: atpFormId, submittedBy: 'engineer@upwingenergy.com'}});

    const [atpTemplateData, setATPTemplateData] = React.useState(null);
    const [prevTechnicianResponses, setPrevTechnicianResponses] = React.useState(null);
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

    async function getPrevTechnicianResponses()
    {
        if(prevSubmissionId)
        {
            try
            {
                let data = await fetch(`http://localhost:8000/atp-submissions/technicianSubmission/${prevSubmissionId}`);
                data = await data.json();
                setPrevTechnicianResponses(data.technicianResponses);
                console.log('technician previous responses', data.technicianResponses);
            }
            
            catch(error)
            {
                console.error('Error fetching technician responses:', error);
                // TODO: Handle error state
            }
        }
    }

    async function loadAllData()
    {
        if (atpFormId)
        {
            await getATPTemplateData();
            await getPrevTechnicianResponses();
            setIsLoading(false);
        }
    }

    function getAnswerFormat(role, questionOrder)
    {
        let question = atpTemplateData.sections[role].items.find(item => item.order === parseInt(questionOrder));
        return question ? question.answerFormat : null;
    }

    function engineerOnSubmit(data)
    {

        /*
        ORIGINAL FORM DATA (from react-hook-form):
        {
            formId: "68a354881d8bf3c326340621",
            submittedBy: "technician@upwingenergy.com", 
            technicianResponses: {
                "1": "Motor tested and operational",                       
            },
            engineerResponses: {     
                "4": "2024-01-15"                       
            }
        }
        
        WHAT THE BACKEND EXPECTS:
        {
            formId: "68a354881d8bf3c326340621",
            submittedBy: "technician@upwingenergy.com",
            technicianResponses: [
                {
                    questionOrder: 1,                  
                    answer: "Motor tested and operational",
                    answerFormat: "text"             
                }
            ],
            engineerResponses: [
                {
                    questionOrder: 4,
                    answer: "2024-01-15",
                    answerFormat: "date"
                }
            ]
        }
        */

        console.log('RAW ENGINEER FORM DATA (before transformation):');
        console.log(data);

        
        let technicianResponses = [];
        for (let questionOrder in data.technicianResponses)
        {
            let answerFormat = getAnswerFormat("technician", questionOrder);
            let answer = data.technicianResponses[questionOrder];
            technicianResponses.push({questionOrder: parseInt(questionOrder), answer: answer, answerFormat: answerFormat});
        }

        data['technicianResponses'] = technicianResponses;

        let engineerResponses = [];
        for (let questionOrder in data.engineerResponses)
        {
            let answerFormat = getAnswerFormat("engineer", questionOrder);
            let answer = data.engineerResponses[questionOrder];
            engineerResponses.push({questionOrder: parseInt(questionOrder), answer: answer, answerFormat: answerFormat});
        }

        data['engineerResponses'] = engineerResponses;

        console.log('TRANSFORMED DATA (for backend):');
        console.log(data);
        
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
            <Navbar title = {"Review ATP"}/>

            <FormHeader 
                title={atpTemplateData.metadata?.title} 
                description={atpTemplateData.metadata?.description} 
            />

            <div className={styles.formContainer}>
                <form className="atp-form" id="submissionForm" onSubmit={handleSubmit(engineerOnSubmit)}>
                    {/* Technician Section - Read-only display of previous responses */}
                    <ATPInputSection 
                        register = {register}
                        userRole = {"technician"} 
                        atpTemplateData = {atpTemplateData} 
                        prevTechnicianResponses = {prevTechnicianResponses} 
                        showButtons = {false}
                    />
                    
                    {/* Engineer Section - Editable inputs for engineer */}
                    <ATPInputSection 
                        register = {register}
                        userRole = {"engineer"} 
                        atpTemplateData = {atpTemplateData} 
                        prevTechnicianResponses = {prevTechnicianResponses} 
                        showButtons = {true}
                    />
                </form>
            </div>
            
            <footer className={styles.footer}>
                <p>&copy; 2024 Upwing Energy. All rights reserved.</p>
            </footer>
        </div>
    )
}