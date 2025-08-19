import React from 'react';
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 'medium', position = 'center' }) {
    const sizeClass = styles[size] || styles.medium;
    const positionClass = styles[position] || styles.center;
    
    return (
        <div className={`${styles.loadingContainer} ${positionClass}`}>
            <div className={`${styles.spinner} ${sizeClass}`}></div>
        </div>
    );
}
