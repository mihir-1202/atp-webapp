import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ManageATPsPage.module.css';

//Path: /manage-atps
export default function ManageATPsPage() {
    const navigate = useNavigate();
    const [atpForms, setATPForms] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('http://localhost:8000/atp-forms/')
            .then(response => response.json())
            .then(data => {
                setATPForms(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching ATP forms:', error);
                setIsLoading(false);
            });
    }, []);

    function handleUpdate(atpId) {
        navigate(`/update-atp/${atpId}`);
    }

    async function handleDelete(atpId) {
        if (window.confirm('Are you sure you want to delete this ATP form and all associated submissions? This action cannot be undone.')) {
            try {
                const response = await fetch(`http://localhost:8000/atp-forms/${atpId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    alert('ATP form deleted successfully!');
                    // Refresh the page to update the list
                    window.location.reload();
                } else {
                    const errorData = await response.json();
                    alert(`Error deleting ATP form: ${errorData.error || 'Unknown error'}`);
                }
            } catch (error) {
                alert(`Error deleting ATP form: ${error.message}`);
            }
        }
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    //atp cards JSX to be displayed
    const atpCardsJSX = atpForms.map((atpForm) => {
        return (
        <div key={atpForm._id} className={styles.manageATPCard}>
            <div className={styles.atpInfoContainer}>
                <div className={styles.atpTitle}>{atpForm.metadata.title}</div>
                <div className={styles.atpDescription}>{atpForm.metadata.description}</div>
            </div>
            
            <div className={styles.actionButtons}>
                <button 
                    className={styles.updateButton}
                    onClick={() => handleUpdate(atpForm._id)}
                >
                    Update
                </button>

                <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(atpForm._id)}
                >
                    Delete
                </button>

            </div>
        </div>
    )})

    //logic to display the page
    return(
        <div className={styles.manageATPsPage}>
            <Navbar title="Manage ATPs" />
            <main className={styles.mainContent}>
                {atpCardsJSX.length === 0 
                    ? 
                    (<div className={styles.noFormsContainer}>
                        <h2 className={styles.noFormsTitle}>No ATP Forms Found</h2>
                        <p className={styles.noFormsDescription}>
                            There are no ATP forms available to manage. Create your first ATP form to get started.
                        </p>
                    </div>) 
                    : 
                    (<div className={styles.manageATPCardsContainer}>
                        {atpCardsJSX}
                    </div>)
                }
            </main>
        </div>
    )
}
