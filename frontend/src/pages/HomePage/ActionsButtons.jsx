import React from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './ActionsButtons.module.css';

export default function ActionsButtons()
{
    const navigate = useNavigate();

    return(
        <div className={styles.buttonsContainer}>
            <button className={styles.atpButton} onClick = {() => navigate('/create-atp')}>Create New ATP</button>
            <button className={styles.atpButton} onClick = {() => navigate('/manage-atps')}>Manage ATPs</button>
            <button className={styles.atpButton}>Drafts</button>
            <button className={styles.atpButton} onClick = {() => navigate('/pending-atps')}>Pending ATPs</button>
            <button className={styles.atpButton} onClick = {() => navigate('/all-atps')}>All ATPs</button>
            <button className={styles.atpButton} onClick = {() => navigate('/add-user')}>Add User</button>
        </div>
    )
}
