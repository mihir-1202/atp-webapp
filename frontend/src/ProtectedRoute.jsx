import {useMsal} from '@azure/msal-react'
import {useNavigate} from 'react-router-dom'

export default function ProtectedRoute({children})
{
    const navigate = useNavigate();
    const {instance} = useMsal();
    const activeAccount = instance.getActiveAccount();

    if (!activeAccount)
    {
        console.log('No active account found, redirecting to login');
        navigate('/login');
        return null;
    }

    console.log('Active account found, rendering children');
    console.log(`User Name: ${activeAccount.name}\nUser Email: ${activeAccount.username}`);
    return children;
}