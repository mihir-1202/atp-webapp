import React from 'react';

export default function FormHeader({formTitle, formDescription})
{
    return(
        <div className="form-header">
            <h1 className="form-title">{formTitle}</h1>
            <h2 className="form-subtitle">{formDescription}</h2>
        </div>
    )
}