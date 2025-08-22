import React from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import Navbar from '../../components/Navbar/Navbar'
import ATPInputSection from '../../components/ATPInputSection/ATPInputSection'
import FormHeader from '../../components/FormHeader/FormHeader'
import styles from './ReviewATPPage.module.css'
import StatusSelector from './StatusSelector'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'

//Path: /review-atp/:atpFormId/:prevSubmissionId

//TODO: avoid repeated logic in this page (ReviewATPPage) and FillATPPage
export default function ReviewATPPage()
{
    const navigate = useNavigate();
    const {atpFormId, prevSubmissionId} = useParams();
    const {register, handleSubmit, reset} = useForm({defaultValues: {formId: atpFormId, reviewedBy: 'engineer@upwingenergy.com'}});

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
                let data = await fetch(`http://localhost:8000/atp-submissions/${prevSubmissionId}`);
                data = await data.json();
                setPrevTechnicianResponses(data.technicianResponses);
                reset({formId: atpFormId, reviewedBy: 'engineer@upwingenergy.com', submittedBy: data.submittedBy, submittedAt: data.submittedAt, submissionId: prevSubmissionId}); //insert the submittedAt to the form data once the data from the api is fetched
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

    function getAnswerFormatAndSpreadsheetCell(role, questionOrder)
    {
        let question = atpTemplateData.sections[role].items.find(item => item.order === parseInt(questionOrder));
        return question ? {answerFormat: question.answerFormat, spreadsheetCell: question.spreadsheetCell} : null;
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
                    answerFormat: "text",
                    spreadsheetCell: "A1"
                }
            ],
            engineerResponses: [
                {
                    questionOrder: 4,
                    answer: "2024-01-15",
                    answerFormat: "date",
                    spreadsheetCell: "B1"
                }
            ]
        }
        */

        //console.log('RAW ENGINEER FORM DATA (before transformation):');
        //console.log(data);

        
        let technicianResponses = [];
        for (let questionOrder in data.technicianResponses)
        {
            let {answerFormat, spreadsheetCell} = getAnswerFormatAndSpreadsheetCell("technician", questionOrder);
            let answer = data.technicianResponses[questionOrder];
            technicianResponses.push({questionOrder: parseInt(questionOrder), spreadsheetCell: spreadsheetCell, answer: answer, answerFormat: answerFormat});
        }

        data['technicianResponses'] = technicianResponses;

        let engineerResponses = [];
        for (let questionOrder in data.engineerResponses)
        {
            let {answerFormat, spreadsheetCell} = getAnswerFormatAndSpreadsheetCell("engineer", questionOrder);
            let answer = data.engineerResponses[questionOrder];
            engineerResponses.push({questionOrder: parseInt(questionOrder), spreadsheetCell: spreadsheetCell, answer: answer, answerFormat: answerFormat});
        }

        data['engineerResponses'] = engineerResponses;
        
        console.log('TRANSFORMED DATA (for backend):', data);
        
        console.log('prevSubmissionId', prevSubmissionId);

        fetch(`http://localhost:8000/atp-submissions/${prevSubmissionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Submission updated successfully:', data);
            
            //TODO: instead of hardcoding alert, display the message returned by the backend
            alert('Submission updated successfully');
            navigate('/');
        })
        .catch(error => {
            console.error('Error updating submission:', error);
            alert('Failed to update submission. Check console for details.');
        });
        
    }

    React.useEffect(() => {loadAllData();}, [atpFormId, prevSubmissionId]);

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!atpTemplateData) {
        return <LoadingSpinner />
    }

    return(
        <div className={styles.fillATPPage}>
            <Navbar title = {"Review Pending ATP"}/>

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
                        //prevTechnicianResponses = {prevTechnicianResponses} 
                        showButtons = {true}
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