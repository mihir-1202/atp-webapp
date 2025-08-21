import React from 'react';
import HeadingItem from '../HeadingItem/HeadingItem';
import FieldItem from '../FieldItem/FieldItem';
import styles from './ATPInputSection.module.css';

export default function ATPInputSection({register, errors = {}, userRole, showButtons, atpTemplateData, readOnly = false, prevTechnicianResponses = [], prevEngineerResponses = []})
{
  
    function getResponse(userRole, questionOrder)
    {
        if (userRole === "technician") {
            return prevTechnicianResponses?.find(response => response.questionOrder === questionOrder);
        }
        else if (userRole === "engineer") {
            //if technician is responding to atp, prevEngineerResponses is null -> use ?. to short circuit before find is executed to avoid errors
            return prevEngineerResponses?.find(response => response.questionOrder === questionOrder);
        }
    }

    let technicianFormItems = atpTemplateData.sections.technician.items;
    let engineerFormItems = atpTemplateData.sections.engineer.items;
    

    
    let technicianFormItemsJSX = technicianFormItems.map(item => {
        
        //If in the pending review page, prevTechnicianResponses is not null -> if the InputSection is for the technician we want to populate the inputs with the previous responses
        const previousResponse = getResponse("technician", item.order);
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
            readOnly = {readOnly}
        />
    });


    let engineerFormItemsJSX = engineerFormItems.map(item => {
        
        //If in the pending review page, prevTechnicianResponses is not null -> if the InputSection is for the technician we want to populate the inputs with the previous responses
        const previousResponse = getResponse("engineer", item.order);
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
            readOnly = {readOnly}
        />
    });

    

    return(
    <>
        <div className={styles.formSection}>
            <h3 className={styles.sectionHeading}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Section</h3>
            <div className={styles.sectionContent}>
                {userRole === "technician" ? technicianFormItemsJSX : engineerFormItemsJSX}  
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