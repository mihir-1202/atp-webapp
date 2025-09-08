import { AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { loginRequest } from '../../auth/authConfig.js';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './LoginPage.module.css';
import LoginScreenImage from './LoginScreen.png';

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
    const { instance, accounts } = useMsal();

    useEffect(() => {
        if (accounts.length > 0 && !instance.getActiveAccount()) {
            instance.setActiveAccount(accounts[0]);
        }
    }, [instance, accounts]);

    const handleLoginRedirect = () => {
        instance.loginRedirect({
                ...loginRequest,
                prompt: 'select_account',
            })
        .catch((error) => console.log(error));
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <div className={styles.loginContent}>
                    <div className={styles.logoSection}>
                        <h1 className={styles.logo}>Upwing Energy</h1>
                        <h2 className={styles.tagline}>ATP Digital Platform</h2>
                    </div>
                    
                    <div className={styles.loginSection}>
                        <button 
                            className={styles.loginButton} 
                            onClick={handleLoginRedirect}
                        >
                            Sign In with Microsoft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};





