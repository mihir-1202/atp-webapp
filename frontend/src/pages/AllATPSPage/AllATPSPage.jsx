import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import SubmissionCardsContainer from '../../components/SubmissionCardsContainer/SubmissionCardsContainer';
import styles from './AllATPSPage.module.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

//Path: /reviewed-atps
export default function PendingATPSPage()
{
    const [allSubmissions, setAllSubmissions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    async function fetchAllSubmissions()
    {
        fetch(`http://localhost:8000/atp-submissions/metadata`)
        .then(response => response.json())
        .then(data => {console.log(data); setAllSubmissions(data); setIsLoading(false);})
        .catch(error => {console.error('Error fetching submissions:', error); setIsLoading(false);})
    }

    React.useEffect(() => {
        fetchAllSubmissions();
    }, []);

    if (isLoading)
        return <LoadingSpinner size = "large" position = "center" />;
    
    return(
        <div className={styles.pageContainer}>
            <Navbar title = "All ATPs" />
            <main className={styles.mainContent}>
                <SubmissionCardsContainer pending = {true} approved = {true} rejected = {true} submissions = {allSubmissions} />
            </main>
        </div>
    )
}