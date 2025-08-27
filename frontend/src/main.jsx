import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CreateATPPage from './pages/CreateATPPage/CreateATPPage.jsx'
import HomePage from './pages/HomePage/HomePage.jsx'
import UpdateATPPage from './pages/UpdateATPPage/UpdateATPPage.jsx'
import SelectATPPage from './pages/SelectATPPage/SelectATPPage.jsx'
import ManageATPsPage from './pages/ManageATPsPage/ManageATPsPage.jsx'

//import FillATPPage from './pages/FillATPPage/FillATPPage.jsx'
//import ReviewATPPage from './pages/ReviewATPPage/ReviewATPPage.jsx'
//import CompletedATPPage from './pages/CompletedATPPage/CompletedATPPage.jsx'
import ReadOnlyATPUI from './components/ReadOnlyATPUI/ReadOnlyATPUI.jsx'
import EditableATPUI from './components/EditableATPUI/EditableATPUI.jsx'

import PendingATPSPage from './pages/PendingATPSPage/PendingATPSPage.jsx'
import AllATPSPage from './pages/AllATPSPage/AllATPSPage.jsx'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },

  {
    path: "/create-atp",
    element: <CreateATPPage />
  },

  {
    path: "/update-atp/:atpFormGroupId",
    element: <UpdateATPPage />
  },

  {
    path: "/select-atp",
    element: <SelectATPPage />
  },

  {
    path: "/fill-atp/:atpFormGroupId",
    element: <EditableATPUI />
  },

  {
    path: "/review-atp/:atpFormGroupId/:prevSubmissionId",
    element: <EditableATPUI />
  },

  {
    path: "/completed-atp/:atpFormId/:prevSubmissionId",
    element: <ReadOnlyATPUI />
  },

  {
    path: "/pending-atps",
    element: <PendingATPSPage />
  },

  {
    path: "/all-atps",
    element: <AllATPSPage />
  },

  {
    path: "/manage-atps",
    element: <ManageATPsPage />
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router} />
  </StrictMode>,
)
