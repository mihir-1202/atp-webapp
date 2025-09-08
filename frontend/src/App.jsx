import LoginPage from './pages/LoginPage/LoginPage.jsx'
import CreateATPPage from './pages/CreateATPPage/CreateATPPage.jsx'
import HomePage from './pages/HomePage/HomePage.jsx'
import UpdateATPPage from './pages/UpdateATPPage/UpdateATPPage.jsx'
import SelectATPPage from './pages/SelectATPPage/SelectATPPage.jsx'
import ManageATPsPage from './pages/ManageATPsPage/ManageATPsPage.jsx'
import ReadOnlyATPUI from './components/ReadOnlyATPUI/ReadOnlyATPUI.jsx'
import EditableATPUI from './components/EditableATPUI/EditableATPUI.jsx'
import PendingATPSPage from './pages/PendingATPSPage/PendingATPSPage.jsx'
import AllATPSPage from './pages/AllATPSPage/AllATPSPage.jsx'
import AddUserPage from './pages/AddUserPage/AddUserPage.jsx'

import UserProvider from './auth/UserProvider.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import {AuthProvider} from './auth/AuthProvider.jsx'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserProvider><ProtectedRoute><HomePage /></ProtectedRoute></UserProvider>
  },

  {
    path: "/login",
    element: <LoginPage />
  },

  {
    path: "/create-atp",
    element: <UserProvider><ProtectedRoute><CreateATPPage /></ProtectedRoute></UserProvider>
  },

  {
    path: "/update-atp/:atpFormGroupId",
    element: <UserProvider><ProtectedRoute><UpdateATPPage /></ProtectedRoute></UserProvider>
  },

  {
    path: "/select-atp",
    element: <UserProvider><ProtectedRoute><SelectATPPage /></ProtectedRoute></UserProvider>
  },

  {
    path: "/fill-atp/:atpFormGroupId",
    element: <UserProvider><ProtectedRoute><EditableATPUI /></ProtectedRoute></UserProvider>
  },

  {
    path: "/review-atp/:atpFormGroupId/:prevSubmissionId",
    element: <UserProvider><ProtectedRoute><EditableATPUI /></ProtectedRoute></UserProvider>
  },

  {
    path: "/completed-atp/:atpFormId/:prevSubmissionId",
    element: <UserProvider><ProtectedRoute><ReadOnlyATPUI /></ProtectedRoute></UserProvider>
  },

  {
    path: "/pending-atps",
    element: <UserProvider><ProtectedRoute><PendingATPSPage /></ProtectedRoute></UserProvider>
  },

  {
    path: "/all-atps",
    element: <UserProvider><ProtectedRoute><AllATPSPage /></ProtectedRoute></UserProvider>
  },

  {
    path: "/manage-atps",
    element: <UserProvider><ProtectedRoute><ManageATPsPage /></ProtectedRoute></UserProvider>
  },

  {
    path: "/add-user",
    element: <UserProvider><ProtectedRoute><AddUserPage /></ProtectedRoute></UserProvider>
  }
])

export default function App()
{
    return(
        <AuthProvider>
            {
            /*All the elements inside the router will be wrapped in the AuthProvider -> 
            all elements will be wrapped in the MsalProvider -> 
            all elements will have access to the MSAL instance*/
            }
            <RouterProvider router = {router} />
        </AuthProvider>
    )
}



