import styles from './FilterSelector.module.css';

export default function FilterSelector({setFilter})
{
    function handleFilterChange(event)
    {
        const selectedValue = event.target.value;
        let newFilter;
        
        if (selectedValue === 'all') {
            newFilter = {pending: true, approved: true, rejected: true};
        } else {
            newFilter = {pending: false, approved: false, rejected: false};
            newFilter[selectedValue] = true;
        }
        
        setFilter(newFilter);
    }

    return(
        <div className={styles.filterContainer}>
            <div className={styles.filterInner}>
                <label className={styles.filterLabel}>
                    Filter by:
                    <select className={styles.filterSelect} onChange = {handleFilterChange} defaultValue="all">
                        <option value = "pending">Pending ATPs</option>
                        <option value = "approved">Approved Reviews</option>
                        <option value = "rejected">Rejected Reviews</option>
                        <option value = "all">All Reviews</option>
                    </select>
                </label>
            </div>
        </div>

    )
}