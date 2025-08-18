import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CreateATPPage from './pages/CreateATPPage.jsx'
import HomePage from './pages/HomePage.jsx'
import FillATPPage from './pages/FillATPPage.jsx'
import App from './App.jsx'
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
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router} />
  </StrictMode>,
)
