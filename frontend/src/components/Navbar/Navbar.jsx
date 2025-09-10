import React from 'react';
import upwingLogo from '../../images/upwing-logo.png';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import LogoutButton from '../LogoutButton/LogoutButton.jsx';

export default function Navbar({ title }) {
    return (
        <nav className={styles.navbar}>
            <Link to = "/" className={styles.logoContainer}>
                <img 
                    className={styles.upwingLogo} 
                    src={upwingLogo} 
                    alt="Upwing Logo" 
                />
                <span className={styles.tooltip}>Go Home</span>
            </Link>
            <span>{title}</span>
            <div className={styles.logoutContainer}>
                <LogoutButton />
            </div>
        </nav>
    );
}
