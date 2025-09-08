import React, {useRef, useContext} from 'react';
import {useParams, useNavigate} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {useLocation} from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import ATPInputSection from '../ATPInputSection/ATPInputSection'
import FormHeader from '../FormHeader/FormHeader'
import styles from './EditableATPUI.module.css'
import StatusSelector from './StatusSelector'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import {UserContext} from '../../auth/UserProvider';
import UnauthorizedUI from '../UnauthorizedUI/UnauthorizedUI.jsx';

//Path: /review-atp/:atpFormGroupId/:prevSubmissionId

//TODO: avoid repeated logic in this page (ReviewATPPage) and FillATPPage
export default function EditableATPUI()
{
    const navigate = useNavigate();
    const location = useLocation().pathname.split('/')[1];
    const {atpFormGroupId, prevSubmissionId} = useParams();
    const startTime = useRef(new Date().toISOString());
    const [error, setError] = React.useState(null);
    

    const user = useContext(UserContext);
    
    if (location === 'review-atp' && user.userRole === 'technician')
    {
        return <UnauthorizedUI message='You are not authorized to review ATP submissions' />;
    }

    let defaultValues;
    //formId will be NULL at first since it is not in the path parameter
    if(location === 'fill-atp')
        defaultValues = {defaultValues: 
            {formGroupId: atpFormGroupId, 
            formId: null, 
            submittedBy: user.userEmail}};

    else if (location === 'review-atp')
        defaultValues = {defaultValues: 
            {formGroupId: atpFormGroupId, 
            formId: null, 
            reviewedBy: user.userEmail}};
    
    
    const {register, handleSubmit, reset, setValue} = useForm(defaultValues);

    const [atpTemplateData, setATPTemplateData] = React.useState(null);
    const [submissionData, setSubmissionData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {loadAllData();}, [atpFormGroupId, prevSubmissionId]);

    //atpTemplateData becomes available -> setAtpTemplateData() is called -> re-render the component -> useEffect runs and resets the form
    /*
    CANNOT do await getATPTemplateData(); await getPrevResponses('technician'); 
    because the re-render is triggered onlyafter the component function is fully executed/rendered -> setPrevTechnicianResponses(null) -> setPrevTechnicianResponses won't be called again after re-render
    */
    React.useEffect(() => {
        if (atpTemplateData && location === 'review-atp' && prevSubmissionId && submissionData) {
            console.log('resetting form with template data');
            
            // Transform technicianResponses to the format that the form works with (see onSubmit function for more details)
            const technicianResponsesFormatted = {};
            if (submissionData?.technicianResponses) {
                submissionData.technicianResponses.forEach(response => {
                    technicianResponsesFormatted[response.questionUUID] = {
                        response: response.answer,
                        lastEdited: response.lastEdited
                    };
                });
            }
            
            //reset the default form values when the data from the api is ready
            reset({
                formGroupId: atpFormGroupId, 
                formId: atpTemplateData._id,
                engineerStartTime: startTime.current,
                technicianStartTime: submissionData.technicianStartTime,
                reviewedBy: user.userEmail, 
                submittedBy: submissionData.submittedBy, 
                submittedAt: submissionData.submittedAt, 
                submissionId: prevSubmissionId,
                technicianResponses: technicianResponsesFormatted
            }); 
        }
    }, [atpTemplateData, location, prevSubmissionId, submissionData]);

    //Get the atp template data from the database
    async function getATPTemplateData()
    {
        const response = await fetch(`http://localhost:8000/atp-forms/active/${atpFormGroupId}`);
        const data = await response.json();

        if (!response.ok)
        {
            console.log('response', response);
            //the string passed to the Error constructor becomes the 'message' property of the Error obejct
            alert(data?.message);
            navigate('/');
            return;
        }

        console.log(data);
        setATPTemplateData(data);
        if(location === 'review-atp')
        {
            console.log('data._id', data._id);
            reset(
                {formGroupId: atpFormGroupId, 
                formId: data._id,
                engineerStartTime: startTime.current,
                reviewedBy: user.userEmail //populate reviewedBy field with the current engineer logged in to prepare for submission
                }); 
        }
        else if(location === 'fill-atp')
        {
            console.log('data._id', data._id);
            reset(
                {formGroupId: atpFormGroupId, 
                formId: data._id,
                technicianStartTime: startTime.current,
                submittedBy: user.userEmail, //populate submittedBy field with the current technician logged in to prepare for submission
                });
        }  
    }

    //Get the previous responses from the database
    async function getPrevResponses()
    {
        if(prevSubmissionId)
        {
            
            const response = await fetch(`http://localhost:8000/atp-submissions/${prevSubmissionId}`);
            const data = await response.json();
            if (!response.ok) 
            {
                alert(data?.message);
                navigate('/');
                return;
            }
            
            
            setSubmissionData(data); // Store the entire submission data
            //When submissionData becomes available after the function is fully executed and the re-render happens, 
            //useEffect will reset the form (it inserts the submittedAt data to the form data)      
        }
    }

    //Load previous responses from the database (does not apply to fill-atp since there are no previous responses)
    async function loadAllData()
    {
        if (atpFormGroupId)
        { 
            await getATPTemplateData();
            if (location !== 'fill-atp')
                await getPrevResponses(); //engineer repsonses will be null for review-atp since the engineer hasnt submitted responses yet
            setIsLoading(false);
        }
        else
        {
            console.error('atpFormGroupId is undefined, cannot load data');
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
                "question1_uuid": {response: "Motor tested and operational", lastEdited: "2024-01-15T10:30:00Z"},                       
            },
            engineerResponses: {     
                "question4_uuid": {response: "2024-01-15", lastEdited: "2024-01-15T10:30:00Z"}                       
            }
        }
        
        WHAT THE BACKEND EXPECTS:
        {
            formGroupId: "68a354881d8bf3c326340621",
            submittedBy: "technician@upwingenergy.com",
            technicianResponses: [
                {
                    questionUUID: "123e4567-e89b-12d3-a456-426614174000",                  
                    answer: "Motor tested and operational",
                    answerFormat: "text",
                    spreadsheetCell: "A1"
                }
            ],
            engineerResponses: [
                {
                    questionUUID: "54321e4567-d43b-14e3-b743-346432704654",
                    answer: "2024-01-15",
                    answerFormat: "date",
                    spreadsheetCell: "B1"
                }
            ]
        }
        */

        console.log('RAW FORM DATA (before transformation):', data);
        //console.log(data);

        
        let formattedTechnicianResponses = [];
        // Check if technicianResponses exists
        if (data?.technicianResponses) {
            //JS arrays are objects under the hood so they can have missing keys -> even though technicianResponses will be an array instead of an object, for in will skip over the missing keys
            for (let questionUUID in data.technicianResponses) {
                const question = getQuestionMetadataByUUID("technician", questionUUID);
                const {answerFormat, spreadsheetCell} = question;
                const answer = data.technicianResponses[questionUUID].response;
                const lastEdited = data.technicianResponses[questionUUID].lastEdited;
                
                
                // Only add if we found the question and answer exists
                if (answerFormat && answer && answer !== '') {
                    formattedTechnicianResponses.push({
                        questionUUID: questionUUID,
                        spreadsheetCell: spreadsheetCell,
                        answer: answer,
                        answerFormat: answerFormat,
                        lastEdited: lastEdited
                    });
                }
            }
        }
        data['technicianResponses'] = formattedTechnicianResponses;

    
        let formattedEngineerResponses = [];
        console.log('engineerResponses', data.engineerResponses);
        console.log('data.engineerResponses', data.engineerResponses);
        if (data?.engineerResponses)
        {
            for (let questionUUID in data.engineerResponses)
            {
                let question = getQuestionMetadataByUUID("engineer", questionUUID);
                let {answerFormat, spreadsheetCell} = question;
                let answer = data.engineerResponses[questionUUID].response;
                const lastEdited = data.engineerResponses[questionUUID].lastEdited;
                formattedEngineerResponses.push({
                    questionUUID: questionUUID,
                    spreadsheetCell: spreadsheetCell, 
                    answer: answer, 
                    answerFormat: answerFormat,
                    lastEdited: lastEdited
                });
            }
        }
        data['engineerResponses'] = formattedEngineerResponses;
        


        
        console.log('TRANSFORMED DATA (for backend):', data);
        console.log('data.formId', data.formId);

        console.log('data.formGroupId', data.formGroupId);
        console.log('data.submittedBy', data.submittedBy);
        console.log('data.submittedAt', data.submittedAt);
        console.log('data.reviewedBy', data.reviewedBy);
        console.log('data.technicianResponses', data.technicianResponses);
        console.log('data.engineerResponses', data.engineerResponses);
        console.log('prevSubmissionId', prevSubmissionId);
        console.log('atpFormGroupId', atpFormGroupId);

        if (location === 'fill-atp')
           createInitialSubmission(data, navigate);

        else if (location === 'review-atp')
            createReviewSubmission(prevSubmissionId, data, navigate);
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!atpTemplateData) {
        return <LoadingSpinner />
    }

    if (error) {
        return <div>{error}</div>;
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
            
                    {atpTemplateData?.sections && (
                        <ATPInputSection 
                            register = {register}
                            role = {"technician"} 
                            atpTemplateData = {atpTemplateData} 
                            prevResponses = {submissionData?.technicianResponses} 
                            showFormActions = {location === 'fill-atp'}
                            readOnly = {location === 'completed-atp'}
                            setValue = {setValue}
                        />
                    )}
                     
                     {(location != 'fill-atp') && atpTemplateData?.sections && (
                        <ATPInputSection 
                            register = {register}
                            role = {"engineer"} 
                            atpTemplateData = {atpTemplateData} 
                            prevResponses = {submissionData?.engineerResponses}
                            showFormActions = {location === 'review-atp'}
                            readOnly = {location === 'completed-atp'}
                            setValue = {setValue}
                        />
                     )}
                </form>
            </div>
            
        </div>
    )
}

async function createInitialSubmission(data, navigate)
{
    const response = await fetch('http://localhost:8000/atp-submissions/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const responseData = await response.json();

    if (!response.ok)
        alert(responseData?.message || 'Failed to submit ATP');

    else
    {
        console.log(responseData);
        alert('ATP submitted successfully');
        navigate('/');
    }

    return responseData;
}


async function createReviewSubmission(prevSubmissionId, data, navigate)
{
    const response = await fetch(`http://localhost:8000/atp-submissions/${prevSubmissionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const responseData = await response.json();

    if (!response.ok) 
        alert(responseData?.message || 'Failed to submit engineering');
    
    else
    {
        console.log('Submission updated successfully:', responseData);
        //TODO: instead of hardcoding alert, display the message returned by the backend
        alert('Submission updated successfully');
        navigate('/');
    }
    
    return responseData;
}
  