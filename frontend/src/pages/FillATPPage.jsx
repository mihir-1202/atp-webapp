import {useParams} from 'react-router-dom'
import Navbar from '../components/FillATPPage/Navbar'
import ATPForm from '../components/FillATPPage/ATPForm'
import styles from '../styles/FillATPPage.module.css'

export default function FillATPPage()
{
    const {atpFormId} = useParams();
    return(
        <div className={styles.fillATPPage}>
            <Navbar title = {"Fill ATP"}/>
            <ATPForm userRole = {"technician"} atpFormId = {atpFormId}/>
        </div>
    )
}