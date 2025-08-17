import React from 'react';
import {useNavigate} from 'react-router-dom';

export default function ActionsButtons()
{
    const navigate = useNavigate();

    return(
        <div className = "buttons-container">
            <button className = "atp-button" onClick = {() => navigate('/create-atp')}>Create New ATP</button>
            <button className = "atp-button">Update ATP</button>
            <button className = "atp-button">Drafts</button>
            <button className = "atp-button">Pending Reviews</button>
            <button className = "atp-button">Approved Reviews</button>
        </div>
    )
}