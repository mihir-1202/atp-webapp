import React from 'react';
import HeadingItem from './HeadingItem';
import FieldItem from './FieldItem';
import styles from '../../styles/FillATPPage.module.css';
import {useForm} from "react-hook-form";

/*
Initial Form Data:
{
  formId: "674a1b2c3d4e5f6789012345",
  submittedBy: "technician@upwing.com",
  technicianResponses: {
    "1": "Motor tested and operational",  // From input registration
    "2": "Pass",
    "5": "Approved for operation"
  }
}
*/


/*
API Post Request Body structure:
{
  "formId": "674a1b2c3d4e5f6789012345",
  "submittedBy": "technician@upwing.com",
  "submittedAt": "2024-01-15T10:30:00Z",
  "technicianResponses": [
    {questionOrder: "1", answerFormat: "text", response: "Motor tested and operational"},
    ],
  "status": "submitted"
}
*/

export default function ATPForm({userRole, atpFormId})
{
    let [isLoading, setIsLoading] = React.useState(true);
    let [atpTemplateData, setATPTemplateData] = React.useState(null);

    const {register, handleSubmit} = useForm({defaultValues: {formId: atpFormId, submittedBy: 'technician@upwingenergy.com'}})
    
    function getFormData()
    {
        fetch(`http://localhost:8000/atp-forms/${atpFormId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data =>{
            setIsLoading(false);
            console.log(data);
            setATPTemplateData(data);
        })
        .catch(error => {
            setIsLoading(false);
            console.error('Error fetching form data:', error);
            // Handle error state
        });
    }

    function onSubmit(data) {
        //data is an Object, not of type FormData
        
        let getAnswerFormat = (questionOrder) => {
            // Convert string to number for comparison
            let question = atpTemplateData.sections.technician.items.find(item => 
                item.order === parseInt(questionOrder)
            );
            return question ? question.answerFormat : null;
        }
        
        let technicianResponses = [];
        
        // Check if technicianResponses exists
        if (data.technicianResponses) {
            for (let questionOrder in data.technicianResponses) {
                let answerFormat = getAnswerFormat(questionOrder);
                let answer = data.technicianResponses[questionOrder];
                
                // Only add if we found the question and answer exists
                if (answerFormat && answer !== undefined && answer !== '') {
                    technicianResponses.push({
                        questionOrder: parseInt(questionOrder), // Convert back to number
                        answer: answer,
                        answerFormat: answerFormat
                    });
                }
            }
        }
    
        data['technicianResponses'] = technicianResponses;
        console.log(data);

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
        });
    }

    React.useEffect(() => {getFormData()}, [atpFormId]);
    
    if(isLoading)
    {
        return <div className={styles.loading}>Loading...</div>;
    }

    //TODO: add error handling if form data is in the incorrect structure
    if (!atpTemplateData || !atpTemplateData.sections || !atpTemplateData.sections.technician || !atpTemplateData.metadata) {
        return <div className={styles.loading}>Error: Unable to load form data</div>;
    }

    let technicianFormItems = atpTemplateData.sections.technician.items;
    console.log(technicianFormItems);
    
    let technicianFormItemsJSX = technicianFormItems.map(item => {
        return item.type === 'heading' ? 
        <HeadingItem key = {item.order} id = {item.order} headingText = {item.content} />
        :
        <FieldItem key = {item.order} id = {item.order} question = {item.question} answerFormat = {item.answerFormat} register = {register} />
    })

    return(
        <div className={styles.formContainer}>
            <div className={styles.formHeader}>
                    <h1 className={styles.formTitle}>{atpTemplateData.metadata.title}</h1>
                <h2 className={styles.formDescription}>{atpTemplateData.metadata.description}</h2>
            </div>

            <form className="atp-form" id="submissionForm" onSubmit = {handleSubmit(onSubmit)}>
                <div className={styles.formSection}>
                    <h3 className={styles.sectionHeading}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Section</h3>
                    <div className={styles.sectionContent}>
                        {technicianFormItemsJSX}  
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="button" className={styles.actionButton}>Save Form</button>
                    <button type="submit" className={styles.actionButton}>Submit Form</button>
                    <button type="button" className={styles.actionButton}>Reset Form</button>
                </div>
                
            </form>

            <footer className={styles.footer}>
                <p>&copy; 2024 Upwing Energy. All rights reserved.</p>
            </footer>
        </div>
    )
}