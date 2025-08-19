import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CreateATPPage from './pages/CreateATPPage.jsx'
import HomePage from './pages/HomePage.jsx'
import FillATPPage from './pages/FillATPPage.jsx'
import ReviewATPPage from './pages/ReviewATPPage.jsx'
import PendingATPSPage from './pages/PendingATPSPage.jsx'
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
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router} />
  </StrictMode>,
)
