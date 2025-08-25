import React from 'react';
import arrowIcon from '../../images/arrow-icon.png';
import {useNavigate} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import styles from './ATPCard.module.css';

export default function ATPCard({atpId, atpTitle, atpDescription})
{
    const navigate = useNavigate();

    const location = useLocation().pathname.split('/')[1];
    const targetLocation = (location === 'select-atp') ? `/update-atp/${atpId}` : `/fill-atp/${atpId}`;

    return(
        <li className={styles.atpCard} onClick = {() => {console.log(atpId); navigate(targetLocation)}}>
            <div className={styles.atpInfoContainer}>
                <div className={styles.atpTitle}>{atpTitle}</div>
                <div className={styles.atpDescription}>{atpDescription}</div> 
            </div>
            <img className={styles.arrowIcon} src={arrowIcon} alt="Arrow Icon"/>
        </li> 
    )
}
