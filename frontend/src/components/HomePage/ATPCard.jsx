import React from 'react';
import arrowIcon from '../../images/arrow-icon.png';

export default function ATPCard({atpId, atpDescription})
{
    return(
        <li className="atp-card">
            <div className = "atp-info-container">
                <div className = "atp-id">{atpId}</div>
                <div className = "atp-description">{atpDescription}</div> 
            </div>
            <img className = "arrow-icon" src={arrowIcon} alt="Arrow Icon"/>
        </li> 
    )
}