import styles from './FormActions.module.css';

export default function FormActions()
{
    return(
        <div className={styles.formActions}>
            <button type="button" className={styles.actionButton}>Save Form</button>
            <button type="submit" className={styles.actionButton}>Submit Form</button>
            <button type="button" className={styles.actionButton}>Reset Form</button>
        </div>
    )
}