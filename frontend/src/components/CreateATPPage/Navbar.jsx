import React from 'react';
import upwingLogo from '../../images/upwing-logo.png';

export default function Navbar({title})
{
    return(
        <nav className="navbar">
            <img 
                className="upwing-logo" 
                src={upwingLogo} 
                alt="Upwing Logo" 
            />
            <span>{title}</span>
        </nav>
    );
}
