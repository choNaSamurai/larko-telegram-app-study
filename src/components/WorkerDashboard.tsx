import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';

export const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const { data } = await dataService.getOrders();
      if (data) setOrders(data);
      setLoading(false);
    };
    loadOrders();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading tasks...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-slate-800">My Tasks</h2>
        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {orders.length} active
        </span>
      </div>

      <div className="space-y-4 text-left">
        {orders.map((order) => (
          <div 
            key={order.id} 
            onClick={() => navigate(`/worker/orders/${order.id}`)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800 line-clamp-1">{order.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                order.status === 'New' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
              <div className="flex flex-col">
                <span className="font-medium text-slate-400">Type</span>
                <span className="text-slate-700 font-semibold">{order.type}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-medium text-slate-400">Quantity</span>
                <span className="text-slate-700 font-semibold">{order.qty} pcs</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <span className="text-xs text-slate-400">
                Deadline: <span className="text-slate-600 font-medium">{order.deadline}</span>
              </span>
              <button className="text-xs font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg">
                Details
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="py-12 text-center flex flex-col items-center">
            <span className="text-3xl mb-4">🎉</span>
            <p className="text-slate-500 font-medium">You have no active orders</p>
          </div>
        )}
      </div>
    </div>
  );
};
