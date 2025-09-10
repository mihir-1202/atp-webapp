import React from 'react';
import styles from './HeadingItem.module.css';

export default function HeadingItem({id, headingText, headingType, imageUrl})
{
    let heading = null;
    switch(headingType)
    {
        case 'h1':
            heading = <h1 className={`${styles.headingText} ${styles.headingH1}`}>{headingText}</h1>;
            break;
        case 'h2':
            heading = <h2 className={`${styles.headingText} ${styles.headingH2}`}>{headingText}</h2>;
            break;
        case 'h3':
            heading = <h3 className={`${styles.headingText} ${styles.headingH3}`}>{headingText}</h3>;
            break;
        case 'h4':
            heading = <h4 className={`${styles.headingText} ${styles.headingH4}`}>{headingText}</h4>
            break;
        case 'h5':
            heading = <h5 className={`${styles.headingText} ${styles.headingH5}`}>{headingText}</h5>;
            break;
        case 'h6':
            heading = <h6 className={`${styles.headingText} ${styles.headingH6}`}>{headingText}</h6>;
            break;
        default:
            heading = <h4 className={`${styles.headingText} ${styles.headingH4}`}>{headingText}</h4>;
            break;
    }

    
    
    return(
        <div className={styles.headingItem} key = {id}>
            {heading}
            
            {imageUrl && (
                <div className={styles.imageContainer}>
                    <img src = {imageUrl} className={styles.headingImage} alt = "Heading Image" />
                </div>
            )}
        </div>
    )
}