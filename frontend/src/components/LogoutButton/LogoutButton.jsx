import { useMsal } from '@azure/msal-react';
import styles from './LogoutButton.module.css';

export default function LogoutButton()
{
    const { instance } = useMsal();
    const handleLogoutRedirect = () => {
        //instance.logoutPopup();
        instance.logoutRedirect();
        window.location.reload();
    }
    return(
        <button className={styles.logoutButton} onClick={handleLogoutRedirect}>Logout</button>
    )
}