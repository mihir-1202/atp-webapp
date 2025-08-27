import React from 'react'

export default function StatusSelector({register})
{
    return(
        <div>
            <label htmlFor="status">Engineering Review Decision:</label>
            <select {...register('status')} required id="status">
                <option value="" disabled>Select status...</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
    )
}