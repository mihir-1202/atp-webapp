import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import MainContent from './MainContent';
import styles from './HomePage.module.css';

//Path: /
export default function HomePage()
{
    return(
        <div className={styles.homePage}>
            <Navbar title = "Homepage" />
            
            <div className={styles.testSelectionTitle}>Test Selection</div>
            
            <MainContent />
        </div>
    )
}