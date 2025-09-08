import React from 'react';
import {useState, useEffect} from 'react';
import ATPCard from '../ATPCard/ATPCard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './ATPCardsContainer.module.css';
import {useNavigate} from 'react-router-dom';

export default function ATPCardsContainer()
{
    const [atpCards, setATPCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchATPCards(){
            const response = await fetch('http://localhost:8000/atp-forms/active');
            const data = await response.json();

            if (!response.ok)
            {
                setIsLoading(false);
                alert(data.message);
                setError(data.message);
                return; // Exit early, don't navigate away
            }

            else{
                setATPCards(data);
                setIsLoading(false);
            }

            
        }
        
        fetchATPCards();
    }, []);

    if(isLoading)
        return (
            <div className={styles.atpCardsContainer}>
                <LoadingSpinner size="large" position="inline" />
            </div>
        )

    if(error)
    {
        console.log('in error');
        return (
            <div className={styles.errorContainer}>
                <h2 className={styles.errorTitle}>Error</h2>
                <p className={styles.errorMessage}>{error}</p>
            </div>
        )
    }
        
    //if there are no ATPs the message should NOT be shown in an ul element
    if(!atpCards || atpCards.length === 0)
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

    else
    {
        console.log('in here');
        const atpCardsJSX = atpCards.map((atpCard) => 
            {
                return <ATPCard 
                    key = {atpCard._id} 
                    atpFormGroupId = {atpCard.metadata.formGroupID}
                    atpFormId = {atpCard._id}
                    atpTitle = {atpCard.metadata.title} 
                    atpDescription = {atpCard.metadata.description}
                />
            });
        
            return(
                <ul className={styles.atpCardsContainer}>
                    {atpCardsJSX}
                </ul>
            )
    }

    
}
