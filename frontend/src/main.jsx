import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CreateATPPage from './pages/CreateATPPage/CreateATPPage.jsx'
import HomePage from './pages/HomePage/HomePage.jsx'
import UpdateATPPage from './pages/UpdateATPPage/UpdateATPPage.jsx'
import SelectATPPage from './pages/SelectATPPage/SelectATPPage.jsx'

//import FillATPPage from './pages/FillATPPage/FillATPPage.jsx'
//import ReviewATPPage from './pages/ReviewATPPage/ReviewATPPage.jsx'
//import CompletedATPPage from './pages/CompletedATPPage/CompletedATPPage.jsx'
import ATPUI from './components/ATPUI/ATPUI.jsx'

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
    path: "/update-atp/:atpFormId",
    element: <UpdateATPPage />
  },

  {
    path: "/select-atp",
    element: <SelectATPPage />
  },

  {
    path: "/fill-atp/:atpFormId",
    element: <ATPUI />
  },

  {
    path: "/review-atp/:atpFormId/:prevSubmissionId",
    element: <ATPUI />
  },

  {
    path: "/completed-atp/:atpFormId/:prevSubmissionId",
    element: <ATPUI />
  },

  {
    path: "/pending-atps",
    element: <PendingATPSPage />
  },

  {
    path: "/all-atps",
    element: <AllATPSPage />
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router} />
  </StrictMode>,
)
