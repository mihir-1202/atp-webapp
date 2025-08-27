import React from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {useLocation} from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import ATPInputSection from '../../components/ATPInputSection/ATPInputSection'
import FormHeader from '../../components/FormHeader/FormHeader'
import styles from './ATPUI.module.css'
import StatusSelector from './StatusSelector'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'

//Path: /review-atp/:atpFormGroupId/:prevSubmissionId

//TODO: avoid repeated logic in this page (ReviewATPPage) and FillATPPage
export default function ATPUI()
{
    const navigate = useNavigate();
    const location = useLocation().pathname.split('/')[1];
    const {atpFormGroupId, atpFormId, prevSubmissionId} = useParams();

    let defaultValues;
    if (location === 'fill-atp')
        defaultValues = {defaultValues: {formGroupId: atpFormGroupId, formId: atpFormId, submittedBy: 'technician@upwingenergy.com'}};
    else
        defaultValues = {defaultValues: {formGroupId: atpFormGroupId, formId: atpFormId, reviewedBy: 'engineer@upwingenergy.com'}};
    
    const {register, handleSubmit, reset} = useForm(defaultValues);

    const [atpTemplateData, setATPTemplateData] = React.useState(null);
    const [prevTechnicianResponses, setPrevTechnicianResponses] = React.useState(null);
    const [prevEngineerResponses, setPrevEngineerResponses] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {loadAllData();}, [atpFormGroupId, atpFormId, prevSubmissionId]);

    //Get the atp template data from the database
    async function getATPTemplateData()
    {
        try {
            let data = null;
            if (location === 'completed-atp')
                data = await fetch(`http://localhost:8000/atp-forms/${atpFormId}`);
            else
                data = await fetch(`http://localhost:8000/atp-forms/active/${atpFormGroupId}`);
            
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
                
                
                //insert the submittedAt to the form data once the data from the api is fetched
                if (location === 'review-atp')
                    reset({formGroupId: atpFormGroupId, formId: atpFormId,
                            reviewedBy: 'engineer@upwingenergy.com', 
                            submittedBy: data.submittedBy, 
                            submittedAt: data.submittedAt, 
                            submissionId: prevSubmissionId
                        }); 
                    
                
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
        if (atpFormGroupId)
        { 
            await getATPTemplateData();
            if (location !== 'fill-atp')
            {
                await getPrevResponses('technician');
                await getPrevResponses('engineer');
            }
            setIsLoading(false);
        }
    }

    //Get the question metadata from the atp template data
    function getQuestionMetadataByUUID(role, questionUUID)
    {
        //iterates through the items in the atpTemplateData.sections.technician.items array and returns the item which has the same uuid as the argument
        let question = atpTemplateData.sections[role].items.find(item => item.uuid === questionUUID);
        return question;
    }

    //Format the data for the backend
    function onSubmit(data)
    {

        /*
        ORIGINAL FORM DATA (from react-hook-form):
        {
            formGroupId: "68a354881d8bf3c326340621",
            submittedBy: "technician@upwingenergy.com", 
            technicianResponses: {
                "question1_uuid": "Motor tested and operational",                       
            },
            engineerResponses: {     
                "question4_uuid": "2024-01-15"                       
            }
        }
        
        WHAT THE BACKEND EXPECTS:
        {
            formGroupId: "68a354881d8bf3c326340621",
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

        
        let formattedTechnicianResponses = [];
        // Check if technicianResponses exists
        if (data.technicianResponses) {
            //JS arrays are objects under the hood so they can have missing keys -> even though technicianResponses will be an array instead of an object, for in will skip over the missing keys
            for (let questionUUID in data.technicianResponses) {
                const question = getQuestionMetadataByUUID("technician", questionUUID);
                const {answerFormat, spreadsheetCell, order} = question;
                const answer = data.technicianResponses[questionUUID];
                
                // Only add if we found the question and answer exists
                if (answerFormat && spreadsheetCell && order && answer !== undefined && answer !== '') {
                    formattedTechnicianResponses.push({
                        questionUUID: questionUUID,
                        questionOrder: typeof order === 'number' ? order : parseInt(order),
                        spreadsheetCell: spreadsheetCell,
                        answer: answer,
                        answerFormat: answerFormat
                    });
                }
            }
        }
        data['technicianResponses'] = formattedTechnicianResponses;

        


        let formattedEngineerResponses = [];
        if (data.engineerResponses)
        {
            for (let questionUUID in data.engineerResponses)
            {
                let question = getQuestionMetadataByUUID("engineer", questionUUID);
                let {id, answerFormat, spreadsheetCell} = question;
                let answer = data.engineerResponses[questionUUID];
                formattedEngineerResponses.push({
                    questionUUID: questionUUID,
                    questionOrder: question.order, 
                    spreadsheetCell: spreadsheetCell, 
                    answer: answer, 
                    answerFormat: answerFormat});
            }
        }
        data['engineerResponses'] = formattedEngineerResponses;
        


        
        console.log('TRANSFORMED DATA (for backend):', data);
        console.log('prevSubmissionId', prevSubmissionId);
        console.log('atpFormGroupId', atpFormGroupId);

       
       
        if (location === 'fill-atp')
        {
            fetch('http://localhost:8000/atp-submissions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Error submitting ATP:', error);
            })
            .then(() => {alert('ATP submitted successfully'); navigate('/');});
        }



        if (location === 'review-atp')
        {
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
        
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!atpTemplateData) {
        return <LoadingSpinner />
    }

    return(
        <div className={styles.fillATPPage}>
            <Navbar title = {location === 'review-atp' ? 'Review Pending ATP' : (location === 'fill-atp' ? 'Fill ATP' : 'View Completed ATP')}/>

            <FormHeader 
                title={atpTemplateData.metadata?.title} 
                description={atpTemplateData.metadata?.description} 
            />

            <div className={styles.formContainer}>
                <form className="atp-form" id="submissionForm" onSubmit={handleSubmit(onSubmit)}>
            
                    <ATPInputSection 
                        register = {register}
                        role = {"technician"} 
                        atpTemplateData = {atpTemplateData} 
                        prevResponses = {prevTechnicianResponses} 
                        showButtons = {location === 'fill-atp'}
                        readOnly = {location === 'completed-atp'}
                    />
                    
                    {
                    (location != 'fill-atp') &&
                    <ATPInputSection 
                        register = {register}
                        role = {"engineer"} 
                        atpTemplateData = {atpTemplateData} 
                        prevResponses = {prevEngineerResponses}
                        showButtons = {location === 'review-atp'}
                        readOnly = {location === 'completed-atp'}
                    />
                    }

                    {location === 'review-atp' && <StatusSelector register = {register} />}
                </form>
            </div>
            
            <footer className={styles.footer}>
                <p>&copy; 2024 Upwing Energy. All rights reserved.</p>
            </footer>
        </div>
    )
}