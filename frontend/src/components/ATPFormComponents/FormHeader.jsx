import styles from '../../styles/FillATPPage.module.css';

export default function FormHeader({ title, description }) {
    return (
        <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>{title}</h1>
            <h2 className={styles.formDescription}>{description}</h2>
        </div>
    );
}