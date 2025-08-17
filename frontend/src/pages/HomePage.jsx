import React from 'react';
import Navbar from '../components/HomePage/Navbar';
import MainContent from '../components/HomePage/MainContent';
import '../styles/HomePage.css';

export default function HomePage()
{
    return(
        <div>
            <Navbar title = "Test Selection" />
            <h1>Test Selection</h1>
            <MainContent />
        </div>
    )
}