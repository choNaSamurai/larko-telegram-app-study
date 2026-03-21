import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useEffect, useState } from 'react';
import { MainLayout } from './components/MainLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { OrderDetails } from './components/OrderDetails';
import { NewOrder } from './components/NewOrder';
import { WorkerBalance } from './components/WorkerBalance';
import { TeamList } from './components/TeamList';
import { WorkerCard } from './components/WorkerCard';
import { FinanceDashboard } from './components/FinanceDashboard';
import { Settings } from './components/Settings';
import { dataService } from './services/dataService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-600 gap-4">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <span className="font-medium">Initializing WorkTracker...</span>
  </div>
);

function App() {
  const { isReady, user, startParam } = useTelegram();
  const [role, setRole] = useState<'admin' | 'worker' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      if (isReady) {
        // Fallback for dev mode where user might be null
        const userId = user?.id || 999999; 
        
        // Pass startParam to getUserRole for invitation handling
        const { data, error } = await dataService.getUserRole(userId, startParam);
        
        if (data) {
          setRole(data.role as 'admin' | 'worker');
        } else if (error && !startParam) {
          // If no profile and no invite, default to worker or show login (for dev: admin)
          console.log('No profile found, defaulting to Admin for Dev');
          setRole('admin');
        } else if (startParam) {
          // Re-fetch after registration if startParam was used
          const retry = await dataService.getUserRole(userId);
          if (retry.data) setRole(retry.data.role as 'admin' | 'worker');
        }
        
        setLoading(false);
      }
    };

    initApp();
  }, [isReady, user, startParam]);

  if (loading) return <LoadingScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/admin/*"
            element={
              role === 'admin' ? (
                <ErrorBoundary>
                  <MainLayout role="admin">
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="orders/new" element={<NewOrder />} />
                      <Route path="workers" element={<TeamList />} />
                      <Route path="workers/:id" element={<WorkerCard />} />
                      <Route path="finance" element={<FinanceDashboard />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/admin" />} />
                    </Routes>
                  </MainLayout>
                </ErrorBoundary>
              ) : <Navigate to="/worker" />
            }
          />
          <Route
            path="/worker/*"
            element={
              role === 'worker' || role === 'admin' ? (
                <ErrorBoundary>
                  <MainLayout role="worker">
                    <Routes>
                      <Route index element={<WorkerDashboard />} />
                      <Route path="orders/:id" element={<OrderDetails />} />
                      <Route path="balance" element={<WorkerBalance />} />
                      <Route path="*" element={<Navigate to="/worker" />} />
                    </Routes>
                  </MainLayout>
                </ErrorBoundary>
              ) : <div className="p-4">Access Denied</div>
            }
          />
          <Route
            path="/"
            element={<Navigate to={role === 'admin' ? "/admin" : "/worker"} />}
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
