import React from 'react';
import Navbar from '../components/HomePage/Navbar';
import MainContent from '../components/HomePage/MainContent';
import styles from '../styles/HomePage.module.css';

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