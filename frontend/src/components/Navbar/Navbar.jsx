import React from 'react';
import upwingLogo from '../../images/upwing-logo.png';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar({ title }) {
    return (
        <Link to = "/">
            <nav className={styles.navbar}>
                <img 
                    className={styles.upwingLogo} 
                    src={upwingLogo} 
                    alt="Upwing Logo" 
                />
                <span>{title}</span>
            </nav>
        </Link>
    );
}
