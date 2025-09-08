import LoginPage from './pages/LoginPage/LoginPage.jsx'
import CreateATPPage from './pages/CreateATPPage/CreateATPPage.jsx'
import HomePage from './pages/HomePage/HomePage.jsx'
import UpdateATPPage from './pages/UpdateATPPage/UpdateATPPage.jsx'
import ManageATPsPage from './pages/ManageATPsPage/ManageATPsPage.jsx'
import ReadOnlyATPUI from './components/ReadOnlyATPUI/ReadOnlyATPUI.jsx'
import EditableATPUI from './components/EditableATPUI/EditableATPUI.jsx'
import PendingATPSPage from './pages/PendingATPSPage/PendingATPSPage.jsx'
import AllATPSPage from './pages/AllATPSPage/AllATPSPage.jsx'
import AddUserPage from './pages/AddUserPage/AddUserPage.jsx'

import UserProvider from './auth/UserProvider.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import {AuthProvider} from './auth/AuthProvider.jsx'
import {createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom'

function Layout() {
  return (
    <UserProvider>
      <Outlet />
    </UserProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },

  //whenever we switch pages, the parent 'element' (UserProvider wrapper) stays the same, but the child inside the 'element' gets swapped (since UserProvider isnt mounted again, the email endpoint doesn't get called multiple times)
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ProtectedRoute><HomePage /></ProtectedRoute>
      },
      {
        path: "create-atp",
        element: <ProtectedRoute><CreateATPPage /></ProtectedRoute>
      },
      {
        path: "update-atp/:atpFormGroupId",
        element: <ProtectedRoute><UpdateATPPage /></ProtectedRoute>
      },
      {
        path: "fill-atp/:atpFormGroupId",
        element: <ProtectedRoute><EditableATPUI /></ProtectedRoute>
      },
      {
        path: "review-atp/:atpFormGroupId/:prevSubmissionId",
        element: <ProtectedRoute><EditableATPUI /></ProtectedRoute>
      },
      {
        path: "completed-atp/:atpFormId/:prevSubmissionId",
        element: <ProtectedRoute><ReadOnlyATPUI /></ProtectedRoute>
      },
      {
        path: "pending-atps",
        element: <ProtectedRoute><PendingATPSPage /></ProtectedRoute>
      },
      {
        path: "all-atps",
        element: <ProtectedRoute><AllATPSPage /></ProtectedRoute>
      },
      {
        path: "manage-atps",
        element: <ProtectedRoute><ManageATPsPage /></ProtectedRoute>
      },
      {
        path: "add-user",
        element: <ProtectedRoute><AddUserPage /></ProtectedRoute>
      }
    ]
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



