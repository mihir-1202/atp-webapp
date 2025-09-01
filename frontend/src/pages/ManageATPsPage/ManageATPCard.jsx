import React from 'react';
import styles from './ManageATPCard.module.css';

export default function ManageATPCard({ atpForm, onUpdate, onDelete }) {
    return (
        <div className={styles.manageATPCard}>
            <div className={styles.atpInfoContainer}>
                <div className={styles.atpTitle}>{atpForm.metadata.title}</div>
                <div className={styles.atpDescription}>{atpForm.metadata.description}</div>
                <div className={styles.atpVersion}>Version {atpForm.metadata.version}</div>
                <div className={styles.atpStatus}>Status: {atpForm.metadata.status}</div>
            </div>
            
            <div className={styles.actionButtons}>
                <button 
                    className={styles.updateButton}
                    onClick={() => onUpdate(atpForm.metadata.formGroupID)}
                >
                    Update
                </button>

                <button 
                    className={styles.deleteButton}
                    onClick={() => onDelete(atpForm.metadata.formGroupID)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
