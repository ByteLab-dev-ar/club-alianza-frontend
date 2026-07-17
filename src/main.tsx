import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ClubAlianzaApp } from './ClubAlianzaApp'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ClubAlianzaApp />
    </StrictMode>,
)
