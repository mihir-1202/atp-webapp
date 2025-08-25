import React from 'react';
import ATPCardsContainer from '../../components/ATPCardsContainer/ATPCardsContainer';
import Navbar from '../../components/Navbar/Navbar';
import styles from './SelectATPPage.module.css';

export default function SelectATPPage()
{
    return(
        <div className={styles.selectATPPage}>
            <Navbar title = "Select ATP to Update" />
            <main className={styles.mainContent}>
                <ATPCardsContainer />
            </main>
        </div>
    )
}