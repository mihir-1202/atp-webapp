import {useMsal} from '@azure/msal-react'
import {useNavigate} from 'react-router-dom'
import {useEffect, useState} from 'react'
import {createContext} from 'react'

export const UserContext = createContext(null);

export default function UserProvider({children})
{
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const {instance} = useMsal();
    const activeAccount = instance.getActiveAccount();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function getUserRole() {
            if (!activeAccount)
            {
                console.log('No active account found, redirecting to login');
                setIsLoading(false);
                navigate('/login');
                return;
            }

            const userEmail = activeAccount?.username;
            console.log('User email:', userEmail);
            const response = await fetch(`http://localhost:8000/atp-users/${userEmail}`);
            const data = await response.json();
            console.log('User role response:', data);
            if (data.userRole === 'unauthorized')
            {
                setIsLoading(false);
                alert('You are not authorized to use this application');
                navigate('/login');
            }

            else{
                setUserRole(data.userRole);
                setIsLoading(false);
            }
        }

        getUserRole();
    }, [activeAccount, navigate]);

    if (isLoading)
        return null;

    if (!userRole || userRole === 'unauthorized')
        return null;

    console.log('Active account found, rendering children');
    console.log(`User Name: ${activeAccount.name}\nUser Email: ${activeAccount.username}`);
    
    
    return (
        <UserContext.Provider value={{userRole, userEmail: activeAccount?.username}}>
            {children}
        </UserContext.Provider>
    )
}