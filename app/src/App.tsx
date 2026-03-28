import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import W1TasksScreen from './features/tasks/components/W1TasksScreen';

const queryClient = new QueryClient();

/**
 * Global App orchestration.
 * Traces to ADR Section 1 (Centralized Routing).
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 antialiased selection:bg-accent-blue/30 selection:text-accent-blue font-sans">
          <Routes>
            {/* W1: My Tasks Home Screen */}
            <Route path="/tasks" element={<W1TasksScreen />} />

            {/* Default Redirection */}
            <Route path="/" element={<Navigate to="/tasks" replace />} />

            {/* Placeholder for future screens (W4, W5, W6) */}
            <Route path="/profile" element={<div className="p-8 text-center mt-20 font-bold opacity-30">Profile Screen Coming Soon</div>} />
            <Route path="/absences" element={<div className="p-8 text-center mt-20 font-bold opacity-30">Absences Screen Coming Soon</div>} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
