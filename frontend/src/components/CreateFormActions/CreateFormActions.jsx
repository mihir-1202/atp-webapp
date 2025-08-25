import React from 'react';
import styles from './CreateFormActions.module.css';

export default function CreateFormActions()
{
    return(
        <div className={styles.actionButtonsContainer}>
            {/* TODO: add functionality to the cancel and the save form button */}
            
            <button 
                className={styles.cancelButton} 
                type="button" 
            >
                Cancel
            </button>
            
            <button 
                className={styles.saveFormButton} 
                type="submit" 
            >
                Save Form
            </button>
        </div>
    )
}
