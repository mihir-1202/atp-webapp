import React from 'react';
import Navbar from '../components/PendingATPSPage/Navbar';
import SubmissionCardsContainer from '../components/PendingATPSPage/SubmissionCardsContainer';
import styles from '../styles/PendingATPSPage.module.css';

//Path: /pending-atps
export default function PendingATPSPage()
{
    return(
        <div className={styles.pageContainer}>
            <Navbar title = "Pending ATPs" />
            <main className={styles.mainContent}>
                <SubmissionCardsContainer />
            </main>
        </div>
    )
}