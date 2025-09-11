import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import SubmissionCardsContainer from '../../components/SubmissionCardsContainer/SubmissionCardsContainer';
import styles from './AllATPSPage.module.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import FilterSelector from '../AllATPSPage/FilterSelector'
import {useNavigate} from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//Path: /all-atps
export default function AllATPSPage()
{
    const [allSubmissions, setAllSubmissions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const navigate = useNavigate();
    const [filter, setFilter] = React.useState({pending: true, approved: true, rejected: true});

    

    React.useEffect(() => {
        async function fetchAllSubmissions()
        {
            const response = await fetch(`${API_BASE_URL}/atp-submissions/metadata`)
            const data = await response.json()
            if (!response.ok)
            {
                setIsLoading(false);
                alert(data?.message || 'Failed to fetch submissions');
                navigate('/');
            }

            else
            {
                console.log(data);
                setAllSubmissions(data);
                setIsLoading(false);
            }
        }

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