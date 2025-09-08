import React from 'react'
import styles from './StatusSelector.module.css'

export default function StatusSelector({register})
{
    return(
        <div className={styles.statusSelector}>
            <label htmlFor="status" className={styles.statusLabel}>Engineering Review Decision:</label>
            <select {...register('status')} required id="status" className={styles.statusSelect} defaultValue="">
                <option value="" disabled hidden>Select status...</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
    )
}