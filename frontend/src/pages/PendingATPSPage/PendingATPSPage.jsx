import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import SubmissionCardsContainer from '../../components/SubmissionCardsContainer/SubmissionCardsContainer';
import styles from './PendingATPSPage.module.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {useNavigate} from 'react-router-dom';
import UnauthorizedUI from '../../components/UnauthorizedUI/UnauthorizedUI.jsx';
import { useContext } from 'react';
import { UserContext } from '../../auth/UserProvider';


//Path: /pending-atps
export default function PendingATPSPage()
{
    const [pendingSubmissions, setPendingSubmissions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const navigate = useNavigate();
    const user = useContext(UserContext);
    
    if (user.userRole == 'technician')
    {
        return <UnauthorizedUI message='You are not authorized to view pending ATPs' />;
    }
    

    React.useEffect(() => {
        async function fetchPendingSubmissions()
        {
            const response = await fetch(`http://localhost:8000/atp-submissions/pending/metadata`)
            const data = await response.json()
            if (!response.ok)
            {
                alert(data?.message || 'Failed to fetch pending submissions');
                navigate('/');
            }

            else
            {
                setPendingSubmissions(data);
                setIsLoading(false);
            }    
        }
        
        fetchPendingSubmissions();
    }, []);

    if (isLoading)
        return <LoadingSpinner size = "large" position = "center" />;
    
    return(
        <div className={styles.pageContainer}>
            <Navbar title = "Pending ATPs" />
            <main className={styles.mainContent}>
                <SubmissionCardsContainer pending = {true} approved = {false} rejected = {false} submissions = {pendingSubmissions} />
            </main>
        </div>
    )
}