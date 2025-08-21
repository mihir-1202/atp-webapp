export default function FilterSelector({setFilter})
{
    function handleFilterChange(event)
    {
        const selectedValue = event.target.value;
        let newFilter;
        
        if (selectedValue === 'all') {
            newFilter = {pending: true, approved: true, rejected: true, all: true};
        } else {
            newFilter = {pending: false, approved: false, rejected: false, all: false};
            newFilter[selectedValue] = true;
        }
        
        setFilter(newFilter);
    }

    return(
        <div>
            <label>
                Filter by:
                <select onChange = {handleFilterChange}>
                    <option value = "pending">Pending ATPs</option>
                    <option value = "approved">Approved Reviews</option>
                    <option value = "rejected">Rejected Reviews</option>
                    <option value = "all">All Reviews</option>
                </select>
            </label>
        </div>

    )
}