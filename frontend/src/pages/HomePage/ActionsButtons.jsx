import React from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './ActionsButtons.module.css';
import {useContext} from 'react';
import {UserContext} from '../../auth/UserProvider';

export default function ActionsButtons()
{
    const navigate = useNavigate();
    const user = useContext(UserContext);

    return(
        <div className={styles.buttonsContainer}>
            {user.userRole === 'admin' && 
            <button className={styles.atpButton} onClick = {() => navigate('/create-atp')}>Create New ATP</button>}
            
            {user.userRole === 'admin' && 
            <button className={styles.atpButton} onClick = {() => navigate('/manage-atps')}>Manage ATPs</button>}
            
            <button className={styles.atpButton}>Drafts</button>
            
            {(user.userRole === 'admin' || user.userRole === 'engineer') && 
            <button className={styles.atpButton} onClick = {() => navigate('/pending-atps')}>Pending ATPs</button>}
            
            <button className={styles.atpButton} onClick = {() => navigate('/all-atps')}>All ATPs</button>
            
            {user.userRole === 'admin' && 
            <button className={styles.atpButton} onClick = {() => navigate('/add-user')}>Add User</button>}
        </div>
    )
}
