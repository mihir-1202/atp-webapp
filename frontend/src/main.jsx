import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CreateATPPage from './pages/CreateATPPage/CreateATPPage.jsx'
import HomePage from './pages/HomePage/HomePage.jsx'
import FillATPPage from './pages/FillATPPage/FillATPPage.jsx'
import ReviewATPPage from './pages/ReviewATPPage/ReviewATPPage.jsx'
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
    path: "/fill-atp/:atpFormId",
    element: <FillATPPage />
  },

  {
    path: "/review-atp/:atpFormId/:prevSubmissionId",
    element: <ReviewATPPage />
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
