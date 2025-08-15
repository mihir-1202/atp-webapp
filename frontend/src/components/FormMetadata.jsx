import React, {useState} from 'react';

export default function FormMetadata({ register })
{ 
    return(
        <section className = "form-info-section">
            <h2>Form Details</h2>

            <div className = "input-group">
                <label htmlFor = "form-title-input" className = "input-label">Form Title</label>
                <input 
                    id = "form-title-input" 
                    required 
                    type = "text"  
                    placeholder = "Enter form title" 
                    {...register("metadata.title")}
                />
            </div>

            <div className = "input-group" id = "form-description-input-group">
                <label htmlFor = "form-description" className = "input-label">Form Description</label>
                <textarea 
                    id = "form-description" 
                    required 
                    placeholder = "Enter form description" 
                    rows = {5} 
                    {...register("metadata.description")}
                />
            </div>
        </section>
    )
}
