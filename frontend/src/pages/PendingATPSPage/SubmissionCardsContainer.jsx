import React from 'react';
import SubmissionCard from './SubmissionCard';
import styles from './SubmissionCardsContainer.module.css';

export default function SubmissionCardsContainer()
{
    const [isLoading, setIsLoading] = React.useState(true);
    const [pendingATPS, setPendingATPS] = React.useState([]);

    async function fetchPendingATPS()
    {
        try {
            let data = await fetch('http://localhost:8000/atp-submissions/pending');
            data = await data.json();
            console.log(data);
            setPendingATPS(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching pending ATPs:', error);
            setIsLoading(false);
        }
    }
    
    const submissionCardsJSX = pendingATPS.map((atpSubmission) => {
        return <SubmissionCard 
            key = {atpSubmission.submissionId}
            atpFormId = {atpSubmission.formId}
            atpSubmissionId = {atpSubmission.submissionId}
            atpFormTitle = {atpSubmission.formTitle}
            atpFormDesc = {atpSubmission.formDescription}
            email = {atpSubmission.submittedBy}
            submittedAt = {atpSubmission.submittedAt}
        />
    })

    React.useEffect(() => {
        fetchPendingATPS();
    }, []);
    
    if (isLoading)
        return <div className={styles.loading}>Loading...</div>;
    
    return(
        <ul className={styles.submissionsContainer}>
            {submissionCardsJSX}
        </ul>
    )
}
