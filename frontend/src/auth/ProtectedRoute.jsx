import {useMsal} from '@azure/msal-react'
import {useNavigate} from 'react-router-dom'
import {useEffect, useState} from 'react'
import {useContext} from 'react'
import {UserContext} from './UserProvider'



export default function ProtectedRoute({children})
{
    const user = useContext(UserContext);
    const navigate = useNavigate();

    if (!user || user?.userRole === 'unauthorized')
    {
        alert('You are not authorized to use this application');
        return null;
    }

    else
        return children;
}