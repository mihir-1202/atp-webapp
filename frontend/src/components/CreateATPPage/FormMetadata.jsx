import React, {useState} from 'react';
import styles from '../../styles/CreateATPPage.module.css';

export default function FormMetadata({ register })
{ 
    return(
        <section className="form-info-section">
            <h2 className={styles.sectionTitle}>Form Details</h2>

            <div className={styles.inputGroup}>
                <label htmlFor="form-title-input" className={styles.inputLabel}>Form Title</label>
                <input 
                    id="form-title-input" 
                    required 
                    type="text"  
                    placeholder="Enter form title" 
                    {...register("metadata.title")}
                />
            </div>

            <div className={styles.inputGroup} id={styles.formDescriptionInputGroup}>
                <label htmlFor="form-description" className={styles.inputLabel}>Form Description</label>
                <textarea 
                    id="form-description" 
                    required 
                    placeholder="Enter form description" 
                    rows={5} 
                    {...register("metadata.description")}
                />
            </div>
        </section>
    )
}
