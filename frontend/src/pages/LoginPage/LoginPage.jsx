import { AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { loginRequest } from '../../authConfig.js';
import { Navigate } from 'react-router-dom';

import './App.css';

/**
 * Most applications will need to conditionally render certain components based on whether a user is signed in or not. 
 * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will 
 * only render their children if a user is authenticated or unauthenticated, respectively. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export default function LoginPage() {
    /**
     * useMsal is hook that returns the PublicClientApplication instance,
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    
    //useMsal() automatically consumes the context of the MsalProvider
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();

    console.log('Login - activeAccount:', activeAccount);
    console.log('Login - all accounts:', instance.getAllAccounts());

    const handleLoginRedirect = () => {
        instance.loginRedirect({
                ...loginRequest,
                prompt: 'create',
            })
        .catch((error) => console.log(error));
    };


    const handleLogoutRedirect = () => {
      instance.logoutPopup({
        postLogoutRedirectUri: '/',
      });
      window.location.reload();
    }

    return (
        <div className="App">
            <AuthenticatedTemplate>
                {activeAccount ? (
                    <Navigate to="/" replace />
                ) : null}
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <button onClick={handleLoginRedirect}> Login </button>
                <p>Please sign in</p>
            </UnauthenticatedTemplate>
            
        </div>
    );
};





