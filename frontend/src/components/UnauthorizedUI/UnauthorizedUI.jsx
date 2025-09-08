import { useNavigate } from 'react-router-dom';
import styles from './UnauthorizedUI.module.css';

export default function UnauthorizedUI({message})
{
    const navigate = useNavigate();
    
    return(
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Error: Unauthorized</h1>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.primaryButton}`} onClick={() => navigate('/')}>Go to Home</button>
                </div>
                <div className={styles.secondaryText}>If you think this is a mistake, contact your administrator.</div>
            </div>
        </div>
    )
}