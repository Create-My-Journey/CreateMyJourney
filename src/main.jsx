import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ChooseJourney from './pages/ChooseJourney.jsx'
import Index from './pages/Index.jsx'
import Transport from './pages/Transport.jsx'
import ChooseAccommodation from './pages/ChooseAccommodation.jsx'
import Restaurants from './pages/Restaurants.jsx'
import ChooseAttractions from './pages/ChooseAttractions.jsx'
import Review from './pages/Review.jsx'
import { createBrowserRouter, RouterProvider, } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/journey",
    element: <ChooseJourney />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "/journey/transport",
        element: <Transport />,
      },
      {
        path: "/journey/accomodation",
        element: <ChooseAccommodation />
      },
      {
        path: "/journey/restaurants",
        element: <Restaurants />,
      },
      {
        path: "/journey/attractions",
        element: <ChooseAttractions />,
      },
      {
        path: "/journey/review",
        element: <Review />
      }
    ]
  }
])

document.title = 'Create My Journey'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)