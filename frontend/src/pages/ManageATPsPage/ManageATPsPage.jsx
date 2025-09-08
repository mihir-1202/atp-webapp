import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ManageATPCard from './ManageATPCard';
import styles from './ManageATPsPage.module.css';

//Path: /manage-atps
export default function ManageATPsPage() {
    const navigate = useNavigate();
    const [atpForms, setATPForms] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchATPForms()
        {
            const response = await fetch('http://localhost:8000/atp-forms/active');
            const data = await response.json();
            if (!response.ok)
            {
                setIsLoading(false);
                alert(data?.message || 'Failed to fetch ATP forms');
                navigate('/');
            }
            else
            {
                console.log(data);
                setATPForms(data);
                setIsLoading(false);
            }
        }

        fetchATPForms();
    }, []);

    function handleUpdate(atpFormGroupId) {
        navigate(`/update-atp/${atpFormGroupId}`);
    }

    async function handleDelete(atpFormGroupId) 
    {
        if (window.confirm('Are you sure you want to delete this ATP form and all associated submissions? This action cannot be undone.')) 
        {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8000/atp-forms/${atpFormGroupId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (!response.ok) 
            {
                setIsLoading(false);
                alert(data?.message || 'Failed to delete ATP form');
            }
            
            //TODO: check if data contains a succes message
            else 
            {
                setIsLoading(false);
                alert('ATP form deleted successfully!');
                // Refresh the page to update the list
                window.location.reload();
            }
        }
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    //atp cards JSX to be displayed
    const atpCardsJSX = atpForms.map((atpForm) => {
        return (
            <ManageATPCard
                key={atpForm.metadata.formGroupID}
                atpForm={atpForm}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />
        );
    });

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
