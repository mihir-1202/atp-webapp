import React from 'react';
import FormBuilder from '../components/CreateATPPage/FormBuilder';
import Navbar from '../components/CreateATPPage/Navbar';
import '../styles/CreateATPPage.css';

export default function CreateATPPage()
{
    return(
        <>
            <Navbar title = {"Create ATP"}/>
            <FormBuilder />
        </>
    )
}