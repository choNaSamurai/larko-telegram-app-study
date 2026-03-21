import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { Plus, Tag, Trash2, Edit2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTypes = async () => {
      const { data } = await dataService.getProductTypes();
      if (data) setTypes(data);
      setLoading(false);
    };
    loadTypes();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Product Settings</h2>
        <button className="p-2 bg-indigo-600 text-white rounded-xl shadow-md active:scale-95 transition-transform">
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {types.map((type) => (
          <div 
            key={type.id}
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <Tag size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{type.name}</h4>
                <p className="text-xs text-slate-400 font-medium">{type.unit_rate} UAH / unit</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Edit2 size={18} />
              </button>
              <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-100 p-5 rounded-3xl">
        <h4 className="text-sm font-bold text-slate-800 mb-2">Default Rates</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Product rates are locked when orders are created. Changing rates here will only affect new orders.
        </p>
      </div>
    </div>
  );
};
