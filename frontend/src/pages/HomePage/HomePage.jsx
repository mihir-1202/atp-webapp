import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import MainContent from './MainContent';
import styles from './HomePage.module.css';

//Path: /
export default function HomePage()
{
    return(
        <div className={styles.homePage}>
            <Navbar title = "Test Selection" />
            
            <MainContent />
        </div>
    )
}