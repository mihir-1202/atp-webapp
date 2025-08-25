import React from 'react';
import styles from './CreateFormActions.module.css';
import {useNavigate} from 'react-router-dom';

export default function CreateFormActions()
{
    const navigate = useNavigate();


    return(
        <div className={styles.actionButtonsContainer}>
            {/* TODO: add functionality to the cancel and the save form button */}
            
            <button 
                className={styles.cancelButton} 
                type="button" 
                onClick = {() => navigate('/')}
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
