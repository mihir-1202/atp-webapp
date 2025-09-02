import React from 'react';
import styles from './HeadingItem.module.css';

export default function HeadingItem({id, headingText, imageUrl})
{
    return(
        <div className={styles.headingItem} key = {id}>
            <h4 className={styles.headingText}>{headingText}</h4>
            
            {imageUrl && (
                <div>
                    <img src = {imageUrl} style = {{width: '50%', height: '50%', objectFit: 'contain'}} alt = "Heading Image" />
                </div>
            )}
        </div>
    )
}