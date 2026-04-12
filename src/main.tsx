import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LoadScript } from '@react-google-maps/api';
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <BrowserRouter>
         <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places", "marker"]}>
            <App />   
         </LoadScript>
      </BrowserRouter>
   </StrictMode>,
)
