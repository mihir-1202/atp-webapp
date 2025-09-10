import {useMsal} from '@azure/msal-react'
import {useContext} from 'react'
import {UserContext} from './UserProvider'
import UnauthorizedUI from '../components/UnauthorizedUI/UnauthorizedUI'



export default function ProtectedRoute({children})
{
    const user = useContext(UserContext);

    if (!user || user?.userRole === 'unauthorized')
        return <UnauthorizedUI message='You are not authorized to use this application' />;

    else
        return children;
}