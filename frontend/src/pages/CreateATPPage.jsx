import React from 'react';
import FormBuilder from '../components/CreateATPPage/FormBuilder';
import Navbar from '../components/CreateATPPage/Navbar';
import styles from '../styles/CreateATPPage.module.css';


//Path: /create-atp
export default function CreateATPPage()
{
    return(
        <div className={styles.createATPPage}>
            <Navbar title = {"Create ATP"}/>
            <FormBuilder />
        </div>
    )
}