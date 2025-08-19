import React from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './ActionsButtons.module.css';

export default function ActionsButtons()
{
    const navigate = useNavigate();

    return(
        <div className={styles.buttonsContainer}>
            <button className={styles.atpButton} onClick = {() => navigate('/create-atp')}>Create New ATP</button>
            <button className={styles.atpButton}>Update ATP</button>
            <button className={styles.atpButton}>Drafts</button>
            <button className={styles.atpButton} onClick = {() => navigate('/pending-atps')}>Pending ATPs</button>
            <button className={styles.atpButton}>Approved Reviews</button>
        </div>
    )
}
