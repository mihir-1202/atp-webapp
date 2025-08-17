import React from 'react';
import {useState, useEffect} from 'react';
import ATPCard from './ATPCard';

export default function ATPCardsContainer()
{
    const [atpCards, setATPCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/form-templates')
        .then(response => response.json())
        .then(data => setATPCards(data))
        .then(() => setIsLoading(false))
        .then(() => console.log(atpCards))
        .catch(error => console.error('Error fetching ATP cards:', error));
    }, []);

    //TODO: add a loading state
    if(isLoading)
    {
        return <div>Loading...</div>
    }

    let atpCardsList = [];

    //TODO: add handling for when there are no ATP cards or when entry in the database is in the wrong format
    if(atpCards.length !== 0)
    {
        atpCardsList = atpCards.map((atpCard) => 
        {
            return <ATPCard 
                key = {atpCard._id} 
                atpId = {atpCard.metadata.title} 
                atpDescription = {atpCard.metadata.description}
            />
        })
    }

    return(
        <ul className="atp-cards-container">
            {atpCardsList}
        </ul>
    )
}