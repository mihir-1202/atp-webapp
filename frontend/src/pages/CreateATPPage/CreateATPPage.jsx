import React from 'react';
import FormBuilder from './FormBuilder';
import Navbar from '../../components/Navbar/Navbar';
import styles from './CreateATPPage.module.css';


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