import { useMsal } from '@azure/msal-react';

export default function LogoutButton()
{
    const { instance } = useMsal();
    const handleLogoutRedirect = () => {
        //instance.logoutPopup();
        instance.logoutRedirect();
        window.location.reload();
    }
    return(
        <button onClick={handleLogoutRedirect}>Logout</button>
    )
}