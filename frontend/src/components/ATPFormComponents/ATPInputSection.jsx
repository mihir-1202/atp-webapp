import React from 'react';
import HeadingItem from './HeadingItem';
import FieldItem from './FieldItem';
import styles from '../../styles/FillATPPage.module.css';


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

export default function ATPInputs({register, errors = {}, userRole, showButtons, atpTemplateData, prevTechnicianResponses = null})
{
  
    function getTechnicianResponse(questionOrder)
    {
        if (!prevTechnicianResponses) {
            return null;
        }
        return prevTechnicianResponses.find(response => response.questionOrder === questionOrder);
    }

    let formItems = userRole === "technician" ? atpTemplateData.sections.technician.items : atpTemplateData.sections.engineer.items;
    
    let formItemsJSX = formItems.map(item => {
        
        //If in the pending review page, prevTechnicianResponses is not null -> if the InputSection is for the technician we want to populate the inputs with the previous responses
        const previousResponse = (userRole === "technician") ? getTechnicianResponse(item.order) : null;
        const previousValue = previousResponse ? previousResponse.answer : '';
        
        return item.type === 'heading' ? 
        <HeadingItem 
            key = {item.order} 
            id = {item.order} 
            headingText = {item.content} 
        />
        :
        <FieldItem 
            key = {item.order} 
            id = {item.order} 
            question = {item.question} 
            answerFormat = {item.answerFormat} 
            register = {register} 
            errors = {errors}
            defaultValue = {previousValue} 
            userRole = {userRole}
        />
    })

    return(
    <>
        <div className={styles.formSection}>
            <h3 className={styles.sectionHeading}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Section</h3>
            <div className={styles.sectionContent}>
                {formItemsJSX}  
            </div>
        </div>

        {showButtons && 
        <div className={styles.formActions}>
            <button type="button" className={styles.actionButton}>Save Form</button>
            <button type="submit" className={styles.actionButton}>Submit Form</button>
            <button type="button" className={styles.actionButton}>Reset Form</button>
        </div>}
    </>
    )
}