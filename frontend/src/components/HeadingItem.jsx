import React, { useState } from 'react';

export default function HeadingItem({order, role, removeItem, register})
{
    // TODO: create the onRemove function in the parent component
    // a list of technician / engineer items should be a part of the Parent component's state [{id: 1, type: "heading"}, ...]
    // onRemove should filter the heading item from the list 
    // clicking the add heading button should add a new heading item to the list
    
    const [headingInput, setHeadingInput] = useState("");

    function handleHeadingInputChange(event)
    {
        setHeadingInput(event.target.value);
    }

    return(
        <li className = "heading-item" data-role = {role}>
            <div className = "item-box-header">
                <h3>Heading</h3>
                <button className = "remove-item-button" type = "button" onClick = {() => removeItem(order)}>−</button>
            </div>
            <div className = "heading-input-container">
                <div className = "input-group heading-input-group" id = "heading-input-group">
                    <label className = "input-label">Heading Text</label>
                    <input 
                        id = {`${role}-heading-${order}`} 
                        className = "heading-input" 
                        type = "text" 
                        name = {`${role}-heading-${order}`} 
                        placeholder = "Enter Heading" 
                        required 
                        {...register(`sections.${role}.items.${order}.content`)}
                    />
                </div>
            </div>
        </li>
    )
}