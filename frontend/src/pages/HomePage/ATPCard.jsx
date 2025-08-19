import React from 'react';
import arrowIcon from '../../images/arrow-icon.png';
import {useNavigate} from 'react-router-dom';
import styles from './ATPCard.module.css';

export default function ATPCard({atpId, atpTitle, atpDescription})
{
    const navigate = useNavigate();

    return(
        <li className={styles.atpCard} onClick = {() => {console.log(atpId); navigate(`/fill-atp/${atpId}`)}}>
            <div className={styles.atpInfoContainer}>
                <div className={styles.atpTitle}>{atpTitle}</div>
                <div className={styles.atpDescription}>{atpDescription}</div> 
            </div>
            <img className={styles.arrowIcon} src={arrowIcon} alt="Arrow Icon"/>
        </li> 
    )
}
