import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initMonitoring } from './lib/monitoring'
import { ClubAlianzaApp } from './ClubAlianzaApp'

// No se espera: el render no depende del monitoreo, y el propio init es un
// no-op sin DSN configurada.
void initMonitoring()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ClubAlianzaApp />
    </StrictMode>,
)
