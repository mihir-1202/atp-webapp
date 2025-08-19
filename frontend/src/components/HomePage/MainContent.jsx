import React from 'react';
import ATPCardsContainer from './ATPCardsContainer';
import ActionsButtons from './ActionsButtons';
import styles from '../../styles/HomePage.module.css';

export default function MainContent()
{
    //TODO: fix display issues with the main content on smaller screens
    return(
        <main className={styles.mainContent}>
            <ATPCardsContainer />
            <ActionsButtons />
        </main>
    )
}