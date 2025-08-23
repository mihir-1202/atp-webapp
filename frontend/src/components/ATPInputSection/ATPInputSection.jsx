import React from 'react';
import HeadingItem from '../HeadingItem/HeadingItem';
import FieldItem from '../FieldItem/FieldItem';
import styles from './ATPInputSection.module.css';

export default function ATPInputSection({register, role, showButtons, atpTemplateData, readOnly = false, prevResponses = []})
{
  
    function getResponseByUUID(questionUUID)
    {
        return prevResponses?.find(response => response.questionUUID === questionUUID);
    }

    const formItems = atpTemplateData.sections[role].items;
    
    let formItemsJSX = formItems.map(item => {
        
        //If in the pending review page, prevTechnicianResponses is not null -> if the InputSection is for the technician we want to populate the inputs with the previous responses
        const previousResponse = getResponseByUUID(item.uuid);
        const previousValue = previousResponse ? previousResponse.answer : '';
        
        return item.type === 'heading' ? 
        <HeadingItem 
            key = {item.uuid} 
            order = {item.order}
            headingText = {item.content} 
        />
        :
        <FieldItem 
            key = {item.uuid} 
            order = {item.order}
            questionUUID = {item.uuid} 
            questionText = {item.content} 
            answerFormat = {item.answerFormat} 
            register = {register} 
            defaultValue = {previousValue} 
            role = {role}
            readOnly = {readOnly}
        />
    });

    return(
    <>
        <div className={styles.formSection}>
            <h3 className={styles.sectionHeading}>{role.charAt(0).toUpperCase() + role.slice(1)} Section</h3>
            <div className={styles.sectionContent}>
                {formItemsJSX}  
            </div>
        </div>

        {showButtons && 
        <div className={styles.formActions}>
            {/* onSubmit submits a post request to /atp-submissions/ */}
            <button type="button" className={styles.actionButton}>Save Form</button>
            <button type="submit" className={styles.actionButton}>Submit Form</button>
            <button type="button" className={styles.actionButton}>Reset Form</button>
        </div>}
    </>
    )
}