import {useMsal} from '@azure/msal-react'
import {useNavigate} from 'react-router-dom'
import {useEffect, useState} from 'react'
import {createContext} from 'react'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner.jsx'


/*
The Full OAuth Flow:

Initially you are not logged in, MSAL is created, inProgress goes into startup, sees no code, and gets set to none (active account is null), 

  Step 1: Authorization Request (Redirect, not POST)

  When you click "Login" button:
  instance.loginRedirect()
  MSAL inProgress goes into login, then it redirects to Microsoft login (you are not on the webapp anymore)
  MSAL redirects your browser to Microsoft:
  GET https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize
    ?client_id=your-app-id
    &redirect_uri=http://localhost:5173
    &response_type=code
    &scope=openid profile

  Step 2: User Authentication

  Microsoft shows login form, user enters credentials, Microsoft validates them by checking the application in the specified tenant.

  Step 3: Authorization Response (Redirect Back)

  Microsoft redirects browser back to your app:
  GET http://localhost:5173/?code=ABC123&state=XYZ
  Fresh page is loaded
  MSAL is created again freshly, its inProgress initially in startup, sees the code in the query, goes in handleRedirect, and once thats done it is in none


  Step 4: Token Exchange (The POST Request)

  Now MSAL makes the one POST request:
  POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
  {
    client_id: "your-app-id",
    code: "ABC123",
    grant_type: "authorization_code",
    redirect_uri: "http://localhost:5173"
  }
*/

export const UserContext = createContext(null);

export default function UserProvider({children})
{
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const {instance, accounts, inProgress} = useMsal();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function getUserRole() {
            /*
            inProgress tracks MSAL's current authentication state
            -none: MSAL is idle and not processing anything (means the login process is complete)
            -handleRedirect: MSAL is processing a redirect request (currently in the process of exhchanging the code for the token)
            -login: user is currently logging in
            -logout: user is currently logging out

            Since the component will mount before MSAL finishes exchanging the code for the token, we need to wait for the token to be obtained before rendering anything that needs to be dispalyed.
            */
            if (inProgress !== 'none') {
                console.log(inProgress);
                setIsLoading(true);
                return;
            }

            const activeAccount = instance.getActiveAccount();
            
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
    }, [accounts, instance, navigate, inProgress]);

    if (isLoading)
        return null;

    if (!userRole || userRole === 'unauthorized')
        return null;

    const activeAccount = instance.getActiveAccount();
    console.log('Active account found, rendering children');
    console.log(`User Name: ${activeAccount?.name}\nUser Email: ${activeAccount?.username}`);
    
    if (isLoading)
        return <LoadingSpinner />;

    return (
        <UserContext.Provider value={{userRole, userEmail: activeAccount?.username}}>
            {children}
        </UserContext.Provider>
    )
}