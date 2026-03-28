import { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { useOrders } from '../../hooks/useOrders';
import { MOCK_COMPANIES } from '../../services/mockData';
import { Header, SkeletonLoader } from '../../components/Header';
import { FilterTabs } from '../../components/FilterTabs';
import { OrderCard } from '../../components/OrderCard';
import { CompanySwitcher, EmptyState } from '../../components/CompanySwitcher';

export function W1MyTasks() {
  const { currentCompany, setCurrentCompany, activeFilter, setFilter } = useOrderStore();
  const { data: orders, isLoading, isError, refetch } = useOrders();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Initialize with first company if none selected
  useEffect(() => {
    if (!currentCompany && MOCK_COMPANIES.length > 0) {
      setCurrentCompany(MOCK_COMPANIES[0]);
    }
  }, [currentCompany, setCurrentCompany]);

  const handleAction = (action: string, orderId: string) => {
    console.log(`Action: ${action} on Order: ${orderId}`);
    if (action === 'add' || action === 'start' || action === 'finish') {
      // TODO: Navigate to Order Hub (W2)
      // Since W2 is not yet implemented, we just show an alert
      alert(`TODO: Перехід до Order Hub (W2) для замовлення ${orderId}. Екран W2 знаходиться в розробці.`);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-20 pt-[68px]">
      <Header 
        title="Мої Завдання" 
        userInitials={currentCompany?.initials || '??'} 
        onAvatarClick={() => setIsSwitcherOpen(true)}
      />

      <main className="px-4 py-4 flex flex-col gap-4 max-w-[420px] mx-auto">
        {/* Filter Section */}
        <div className="sticky top-[68px] z-40 bg-bg-primary/95 py-2">
          <FilterTabs 
            activeFilter={activeFilter} 
            onFilterChange={setFilter}
            counts={{
              all: orders?.length,
              new: orders?.filter(o => o.status === 'new').length,
              in_progress: orders?.filter(o => o.status === 'in_progress').length,
              completed: orders?.filter(o => o.status === 'completed').length,
            }}
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <SkeletonLoader />
          ) : isError ? (
            <div className="text-center py-10 flex flex-col gap-3">
              <p className="text-status-error font-medium">Помилка завантаження</p>
              <button 
                onClick={() => refetch()}
                className="text-status-info underline"
              >
                Спробувати знову
              </button>
            </div>
          ) : !orders || orders.length === 0 ? (
            <EmptyState />
          ) : (
            orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onAction={(action) => handleAction(action, order.id)}
              />
            ))
          )}
        </div>
      </main>

      <CompanySwitcher 
        isOpen={isSwitcherOpen} 
        onClose={() => setIsSwitcherOpen(false)} 
      />
      
      {/* Bottom Navigation Mock */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-card/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-50 max-w-[420px] mx-auto">
         <div className="flex flex-col items-center gap-1 text-white">
            <div className="size-1 rounded-full bg-white mb-0.5" />
            <span className="text-[10px] font-bold">Tasks</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-content-secondary opacity-50">
            <span className="text-[10px] font-medium">Balance</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-content-secondary opacity-50">
            <span className="text-[10px] font-medium">Profile</span>
         </div>
      </nav>
    </div>
  );
}
