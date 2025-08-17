import React from 'react';

export default function FormActions()
{
    return(
        <div className = "action-buttons-container">
            {/* TODO: add functionality to the cancel and the save form button */}
            
            <button 
                className = "cancel-button" 
                type = "button" 
            >
                Cancel
            </button>
            
            <button 
                className = "save-form-button" 
                type = "submit" 
            >
                Save Form
            </button>
        </div>
    )
}
