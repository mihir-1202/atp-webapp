import React from 'react';
import {useState, useEffect} from 'react';
import ATPCard from '../ATPCard/ATPCard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './ATPCardsContainer.module.css';

export default function ATPCardsContainer()
{
    const [atpCards, setATPCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/atp-forms')
        .then(response => response.json())
        .then(data => setATPCards(data))
        .then(() => setIsLoading(false))
        .then(() => console.log(atpCards))
        .catch(error => console.error('Error fetching ATP cards:', error));
    }, []);

    if(isLoading)
        return (
            <div className={styles.atpCardsContainer}>
                <LoadingSpinner size="large" position="inline" />
            </div>
        )

    //if there are no ATPs the message should NOT be shown in an ul element
    if(atpCards.length === 0)
    {
        return (
            <div className={styles.noATPsContainer}>
                <div className={styles.noATPsMessage}>
                    <h2 className={styles.noATPsTitle}>No ATP Forms Found</h2>
                    <p className={styles.noATPsDescription}>
                        There are no ATP forms available to display. Create your first ATP form to get started.
                    </p>
                </div>
            </div>
        );
    }

    const atpCardsList = atpCards.map((atpCard) => 
    {
        return <ATPCard 
            key = {atpCard._id} 
            atpId = {atpCard._id}
            atpTitle = {atpCard.metadata.title} 
            atpDescription = {atpCard.metadata.description}
        />
    });

    return(
        <ul className={styles.atpCardsContainer}>
            {atpCardsList}
        </ul>
    )
}
