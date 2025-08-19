import React from 'react';
import HeadingItem from '../HeadingItem/HeadingItem';
import FieldItem from '../FieldItem/FieldItem';
import styles from './ATPInputSection.module.css';

export default function ATPInputSection({register, errors = {}, userRole, showButtons, atpTemplateData, prevTechnicianResponses = null})
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