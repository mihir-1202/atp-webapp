import {useNavigate} from 'react-router-dom';
import arrowIcon from '../../images/arrow-icon.png';
import styles from './SubmissionCard.module.css';

export default function SubmissionCard({atpFormId, atpFormGroupId, atpSubmissionId, atpFormTitle, atpFormDesc, submittedBy, submittedAt, status, reviewedBy = null, reviewedAt = null})
{
    const navigate = useNavigate();
    
    // Determine the status class based on the status prop
    const getStatusClass = (status) => {
        switch(status) {
            case 'approved': return styles.approved;
            case 'rejected': return styles.rejected;
            case 'pending': 
            default: return styles.pending;
        }
    };

    // Format status text for display
    const getStatusText = (status) => {
        switch(status) {
            case 'approved': return 'Status: Approved';
            case 'rejected': return 'Status: Rejected';
            case 'pending': 
            default: return 'Status: Pending Review';
        }
    };

    function onClick()
    {
        if (status === 'pending')
            navigate(`/review-atp/${atpFormGroupId}/${atpSubmissionId}`);
        else
            navigate(`/completed-atp/${atpFormId}/${atpSubmissionId}`);
    }

    return(
        <li className={styles.submissionCard} onClick = {onClick}>
            <div className={styles.submissionInfo}>
                <div className={styles.submissionTitle}>{atpFormTitle}</div>
                <div className={styles.submissionDescription}>{atpFormDesc}</div>
                <div className={styles.submissionMeta}>
                    <span className={styles.submittedBy}>Submitted by: {submittedBy}</span>
                    <span className={styles.submittedDate}>Date Submitted: {submittedAt}</span>
                    {reviewedBy && (
                        <>
                            <span className={styles.reviewedBy}>Reviewed by: {reviewedBy}</span>
                            <span className={styles.reviewedDate}>Date Reviewed: {reviewedAt}</span>
                        </>
                    )}
                    <span className={`${styles.status} ${getStatusClass(status)}`}>{getStatusText(status)}</span>
                </div>
            </div>
            <img className={styles.arrowIcon} src={arrowIcon} alt="Arrow Icon" />
        </li> 
    )
}
