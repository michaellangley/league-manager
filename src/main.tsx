import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LeagueProvider } from './state/LeagueContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LeagueProvider>
       <App />
    </LeagueProvider>
  </StrictMode>,
)
