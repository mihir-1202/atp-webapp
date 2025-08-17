import React from 'react';
import ATPCardsContainer from './ATPCardsContainer';
import ActionsButtons from './ActionsButtons';

export default function MainContent()
{
    //TODO: fix display issues with the main content on smaller screens
    return(
        <main>
            <ATPCardsContainer />
            <ActionsButtons />
        </main>
    )
}