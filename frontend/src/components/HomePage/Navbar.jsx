import React from 'react';
import upwingLogo from '../../images/upwing-logo.png';
import {useNavigate} from 'react-router-dom';
import styles from '../../styles/HomePage.module.css';

export default function Navbar({title})
{
    const navigate = useNavigate();
    
    return(
        <nav className={styles.navbar}>
            <img 
                className={styles.upwingLogo} 
                src={upwingLogo} 
                alt="Upwing Logo" 
                onClick = {() => navigate('/')}
            />
            <span>{title}</span>
        </nav>
    );
}
