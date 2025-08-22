import React from 'react'
import {useParams} from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import ATPInputSection from '../../components/ATPInputSection/ATPInputSection'
import FormHeader from '../../components/FormHeader/FormHeader'
import styles from './FillATPPage.module.css'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

//Path: /fill-atp/:atpFormId
export default function FillATPPage()
{
    const navigate = useNavigate();
    const {atpFormId} = useParams();

    const [atpTemplateData, setATPTemplateData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    
    const {register, handleSubmit} = useForm({
        defaultValues: {
            formId: atpFormId,
            submittedBy: 'technician@upwingenergy.com'
        }
    });

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

    async function loadAllData()
    {
        if (atpFormId)
        {
            await getATPTemplateData();
            setIsLoading(false);
        }
    }

    function getAnswerFormatAndSpreadsheetCell(questionOrder)
    {
        let question = atpTemplateData.sections.technician.items.find(item => item.order === parseInt(questionOrder));
        return question ? {answerFormat: question.answerFormat, spreadsheetCell: question.spreadsheetCell} : null;
    }

    function technicianOnSubmit(data) {
        /*
        ORIGINAL FORM DATA (from react-hook-form):
        {
            formId: "68a354881d8bf3c326340621",
            submittedBy: "technician@upwingenergy.com", 
            technicianResponses: {
                "1": "Motor tested and operational",     
                "3": "2024-01-15"                       
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
                },
                
                {
                    questionOrder: 3,
                    answer: "2024-01-15",
                    answerFormat: "date",
                    spreadsheetCell: "A3"
                }
            ]
        }
        */
       console.log('original form data: ', data);
        
        let formattedTechnicianResponses = [];
        
        // Check if technicianResponses exists
        if (data.technicianResponses) {
            //JS arrays are objects under the hood so they can have missing keys -> even though technicianResponses will be an array instead of an object, for in will skip over the missing keys
            for (let questionOrder in data.technicianResponses) {
                let {answerFormat, spreadsheetCell} = getAnswerFormatAndSpreadsheetCell(questionOrder);
                let answer = data.technicianResponses[questionOrder];
                
                // Only add if we found the question and answer exists
                if (answerFormat && spreadsheetCell && answer !== undefined && answer !== '') {
                    formattedTechnicianResponses.push({
                        questionOrder: parseInt(questionOrder), // Convert back to number
                        spreadsheetCell: spreadsheetCell,
                        answer: answer,
                        answerFormat: answerFormat
                    });
                }
            }
        }
    
        data['technicianResponses'] = formattedTechnicianResponses;
        console.log('transformed form data: ', data);

        //TODO: fix issue where user can submit empty fields
        /*
        If a user never touches a field, React Hook Form will:
        Not include it in the form data object at all
        */
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

    React.useEffect(() => {loadAllData();}, [atpFormId]);

    if (isLoading) {
        return <LoadingSpinner size = "large" position = "center" />;
    }

    if (!atpTemplateData) {
        return <div className={styles.loading}>Error: Could not load ATP data</div>;
    }

    return(
        <div className={styles.fillATPPage}>
            <Navbar title = {"Fill ATP"}/>

            <FormHeader 
                title={atpTemplateData.metadata?.title} 
                description={atpTemplateData.metadata?.description} 
            />

            <div className={styles.formContainer}>
                <form className="atp-form" 
                id="submissionForm" 
                onSubmit = {handleSubmit(technicianOnSubmit)}>
                    <ATPInputSection 
                        register = {register}
                        userRole = {"technician"}
                        showButtons = {true}
                        atpTemplateData = {atpTemplateData}
                    />
                </form>
            </div>

               
            
            <footer className={styles.footer}>
                <p>&copy; 2024 Upwing Energy. All rights reserved.</p>
            </footer>
        </div>  
    )
}