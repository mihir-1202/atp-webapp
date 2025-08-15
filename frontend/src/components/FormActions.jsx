import React from 'react';

export default function FormActions({ onCancel, onSave })
{
    return(
        <div className = "action-buttons-container">
            {/* TODO: add functionality to the cancel and the save form button */}
            
            <button 
                className = "cancel-button" 
                type = "button" 
                onClick = {onCancel}
            >
                Cancel
            </button>
            
            <button 
                className = "save-form-button" 
                type = "submit" 
                onClick = {onSave}
            >
                Save Form
            </button>
        </div>
    )
}
