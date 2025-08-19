import React from 'react';
import upwingLogo from '../../images/upwing-logo.png';
import {useNavigate} from 'react-router-dom';
import styles from '../../styles/PendingATPSPage.module.css';

export default function Navbar({title})
{
    const navigate = useNavigate();
    
    return(
        <nav className={styles.navbar} onClick = {() => navigate('/')} style = {{cursor: 'pointer'}}>
            <img className={styles.upwingLogo} src={upwingLogo} alt="Upwing Logo" />
            {title}
        </nav>
    )
}