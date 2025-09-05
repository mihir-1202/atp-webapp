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

import ProtectedRoute from './ProtectedRoute.jsx'
import {AuthProvider} from './AuthProvider.jsx'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><HomePage /></ProtectedRoute>
  },

  {
    path: "/login",
    element: <LoginPage />
  },

  {
    path: "/create-atp",
    element: <ProtectedRoute><CreateATPPage /></ProtectedRoute>
  },

  {
    path: "/update-atp/:atpFormGroupId",
    element: <ProtectedRoute><UpdateATPPage /></ProtectedRoute>
  },

  {
    path: "/select-atp",
    element: <ProtectedRoute><SelectATPPage /></ProtectedRoute>
  },

  {
    path: "/fill-atp/:atpFormGroupId",
    element: <ProtectedRoute><EditableATPUI /></ProtectedRoute>
  },

  {
    path: "/review-atp/:atpFormGroupId/:prevSubmissionId",
    element: <ProtectedRoute><EditableATPUI /></ProtectedRoute>
  },

  {
    path: "/completed-atp/:atpFormId/:prevSubmissionId",
    element: <ProtectedRoute><ReadOnlyATPUI /></ProtectedRoute>
  },

  {
    path: "/pending-atps",
    element: <ProtectedRoute><PendingATPSPage /></ProtectedRoute>
  },

  {
    path: "/all-atps",
    element: <ProtectedRoute><AllATPSPage /></ProtectedRoute>
  },

  {
    path: "/manage-atps",
    element: <ProtectedRoute><ManageATPsPage /></ProtectedRoute>
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



