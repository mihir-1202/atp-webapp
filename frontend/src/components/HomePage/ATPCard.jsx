import React from 'react';
import arrowIcon from '../../images/arrow-icon.png';
import {useNavigate} from 'react-router-dom';

export default function ATPCard({atpId, atpTitle, atpDescription})
{
    const navigate = useNavigate();


    return(
        <li className="atp-card" onClick = {() => {console.log(atpId); navigate(`/fill-atp/${atpId}`)}}>
            <div className = "atp-info-container">
                <div className = "atp-title">{atpTitle}</div>
                <div className = "atp-description">{atpDescription}</div> 
            </div>
            <img className = "arrow-icon" src={arrowIcon} alt="Arrow Icon"/>
        </li> 
    )
}