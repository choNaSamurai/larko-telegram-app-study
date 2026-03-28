import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { init } from '@telegram-apps/sdk'
import './index.css'
import App from './App.tsx'

// Initialize the Telegram Mini Apps SDK
try {
  init();
} catch (e) {
  console.error('Failed to initialize TMA SDK:', e);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
