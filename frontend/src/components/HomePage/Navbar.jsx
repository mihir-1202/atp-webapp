import React from 'react';
import upwingLogo from '../../images/upwing-logo.png';
import {useNavigate} from 'react-router-dom';

export default function Navbar({title})
{
    const navigate = useNavigate();
    
    return(
        <nav className="navbar">
            <img 
                className="upwing-logo" 
                src={upwingLogo} 
                alt="Upwing Logo" 
                onClick = {() => navigate('/')}
            />
            <span>{title}</span>
        </nav>
    );
}
