import React from 'react';
import styles from '../../styles/FillATPPage.module.css';

export default function HeadingItem({id, headingText})
{
    return(
        <div className={styles.headingItem} key = {id}>
            <h4 className={styles.headingText}>{headingText}</h4>
        </div>
    )

}