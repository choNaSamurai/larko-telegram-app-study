import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { User, ChevronRight, Search } from 'lucide-react';

export const TeamList: React.FC = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadWorkers = async () => {
      const { data } = await dataService.getWorkers();
      if (data) setWorkers(data);
      setLoading(false);
    };
    loadWorkers();
  }, []);

  const filteredWorkers = workers.filter(w => 
    w.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-400">Loading team...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Team Management</h2>
        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
          {workers.length} Workers
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search worker..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 ring-indigo-100 outline-none transition-all"
        />
      </div>

      <div className="space-y-3">
        {filteredWorkers.map((worker) => (
          <button
            key={worker.id}
            onClick={() => navigate(`/admin/workers/${worker.id}`)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-[0.99] transition-transform text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{worker.full_name}</h3>
                <p className="text-xs text-slate-400 font-medium">
                  {worker.active_orders} active orders • {worker.hourly_rate} UAH/h
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
        ))}

        {filteredWorkers.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            No workers found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};
