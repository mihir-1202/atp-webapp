import React from 'react';
import ATPCardsContainer from '../../components/ATPCardsContainer/ATPCardsContainer';
import ActionsButtons from './ActionsButtons';
import styles from './MainContent.module.css';

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
