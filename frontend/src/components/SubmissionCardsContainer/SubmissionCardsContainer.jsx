import React from 'react';
import SubmissionCard from '../SubmissionCard/SubmissionCard';
import styles from './SubmissionCardsContainer.module.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

export default function SubmissionCardsContainer({pending = false, approved = false, rejected = false, submissions = []})
{
    // Ensure submissions is always an array
    if (!Array.isArray(submissions)) {
        console.error('Submissions is not an array:', submissions);
        return <div>Error: Unable to load submissions</div>;
    }

    if (submissions.length === 0)
        return <div>No ATPs to show.</div>;
    
    const filteredSubmissions = submissions.filter((atpSubmission) => {
        if (pending && atpSubmission.status === 'pending')
            return true;
        if (approved && atpSubmission.status === 'approved')
            return true;
        if (rejected && atpSubmission.status === 'rejected')
            return true;
        return false;
    })

    let submissionCardsJSX = filteredSubmissions.map((atpSubmission) => {
        return <SubmissionCard 
            key = {atpSubmission.submissionId}
            
            //used for routing
            atpFormId = {atpSubmission.formId}
            atpFormGroupId = {atpSubmission.formGroupId}
            atpSubmissionId = {atpSubmission.submissionId}
            
            atpFormTitle = {atpSubmission.formTitle}
            atpFormDesc = {atpSubmission.formDescription}
            submittedBy = {atpSubmission.submittedBy}
            submittedAt = {atpSubmission.submittedAt}
            reviewedBy = {atpSubmission.reviewedBy}
            reviewedAt = {atpSubmission.reviewedAt}
            status = {atpSubmission.status}
        />
    })
    
    return(
        <ul className={styles.submissionsContainer}>
            {submissionCardsJSX}
        </ul>
    )
}
