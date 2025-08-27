import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import SubmissionCardsContainer from '../../components/SubmissionCardsContainer/SubmissionCardsContainer';
import styles from './AllATPSPage.module.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import FilterSelector from '../AllATPSPage/FilterSelector'

//Path: /all-atps
export default function AllATPSPage()
{
    const [allSubmissions, setAllSubmissions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const [filter, setFilter] = React.useState({pending: true, approved: true, rejected: true});

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
            <FilterSelector setFilter = {setFilter} />
            <main className={styles.mainContent}>
                <SubmissionCardsContainer 
                    pending = {filter.pending} 
                    approved = {filter.approved} 
                    rejected = {filter.rejected} 
                    submissions = {allSubmissions} 
                />
            </main>
        </div>
    )
}