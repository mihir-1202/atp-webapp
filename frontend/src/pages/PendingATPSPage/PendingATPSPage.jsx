import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import SubmissionCardsContainer from './SubmissionCardsContainer';
import styles from './PendingATPSPage.module.css';

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