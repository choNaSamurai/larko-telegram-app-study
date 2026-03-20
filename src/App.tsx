import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useEffect, useState } from 'react';
import { MainLayout } from './components/MainLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { OrderDetails } from './components/OrderDetails';
import { NewOrder } from './components/NewOrder';
import { dataService } from './services/dataService';

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-600 gap-4">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <span className="font-medium">Initializing WorkTracker...</span>
  </div>
);

function App() {
  const { isReady, user } = useTelegram();
  const [role, setRole] = useState<'admin' | 'worker' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && user) {
      const fetchRole = async () => {
        const { data, error } = await dataService.getUserRole(user.id);

        if (data) {
          setRole(data.role as 'admin' | 'worker');
        } else if (error) {
          console.error('Error fetching user role:', error);
          setRole('worker');
        }
        setLoading(false);
      };

      fetchRole();
    } else if (isReady && !user) {
      // Dev mode outside Telegram
      setRole('admin');
      setLoading(false);
    }
  }, [isReady, user]);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        <Route 
          path="/admin/*" 
          element={
            role === 'admin' ? (
              <MainLayout role="admin">
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders/new" element={<NewOrder />} />
                  <Route path="*" element={<Navigate to="/admin" />} />
                </Routes>
              </MainLayout>
            ) : <Navigate to="/worker" />
          } 
        />
        <Route 
          path="/worker/*" 
          element={
            role === 'worker' || role === 'admin' ? (
              <MainLayout role="worker">
                <Routes>
                  <Route index element={<WorkerDashboard />} />
                  <Route path="orders/:id" element={<OrderDetails />} />
                  <Route path="*" element={<Navigate to="/worker" />} />
                </Routes>
              </MainLayout>
            ) : <div className="p-4">Access Denied</div>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={role === 'admin' ? "/admin" : "/worker"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
