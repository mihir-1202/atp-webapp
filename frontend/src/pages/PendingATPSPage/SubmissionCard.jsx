import {useNavigate} from 'react-router-dom';
import arrowIcon from '../../images/arrow-icon.png';
import styles from './SubmissionCard.module.css';

export default function SubmissionCard({atpFormId, atpSubmissionId, atpFormTitle, atpFormDesc, email, submittedAt})
{
    const navigate = useNavigate();
    return(
        <li className={styles.submissionCard} onClick = {() => navigate(`/review-atp/${atpFormId}/${atpSubmissionId}`)}>
            <div className={styles.submissionInfo}>
                <div className={styles.submissionTitle}>{atpFormTitle}</div>
                <div className={styles.submissionDescription}>{atpFormDesc}</div>
                <div className={styles.submissionMeta}>
                    <span className={styles.submittedBy}>Submitted by: {email}</span>
                    <span className={styles.submittedDate}>Date Submitted: {submittedAt}</span>
                    <span className={`${styles.status} ${styles.pending}`}>Status: Pending Review</span>
                </div>
            </div>
            <img className={styles.arrowIcon} src={arrowIcon} alt="Arrow Icon" />
        </li> 
    )
}
