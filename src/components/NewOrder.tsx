import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

export const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orderNumber: '',
    productType: '',
    quantity: 1,
    deadline: '',
    workerId: '',
    paymentModel: 'per_unit',
    notes: ''
  });
  const productTypes = [
    { id: '1', name: 'Welding', rate: 150 },
    { id: '2', name: 'Milling', rate: 200 },
    { id: '3', name: 'Assembly', rate: 100 },
  ];

  const workers = [
    { id: 'w1', name: 'Ivan S.' },
    { id: 'w2', name: 'Petro K.' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Order created:', formData);
    navigate('/admin/orders');
  };

  return (
    <div className="space-y-6 text-left pb-24">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-500 mb-2">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-800">New Order</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">Order Number (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. #1024"
              value={formData.orderNumber}
              onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-700 focus:ring-2 ring-indigo-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">Product Type</label>
              <select 
                required
                value={formData.productType}
                onChange={(e) => setFormData({...formData, productType: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-700 focus:ring-2 ring-indigo-100 transition-all appearance-none"
              >
                <option value="">Select...</option>
                {productTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">Quantity</label>
              <input 
                type="number" 
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-700 focus:ring-2 ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">Assign Worker</label>
            <select 
              required
              value={formData.workerId}
              onChange={(e) => setFormData({...formData, workerId: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-700 focus:ring-2 ring-indigo-100 transition-all appearance-none"
            >
              <option value="">Select worker...</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">Deadline</label>
            <input 
              type="date" 
              required
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-semibold text-slate-700 focus:ring-2 ring-indigo-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">Payment Model</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setFormData({...formData, paymentModel: 'per_unit'})}
                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  formData.paymentModel === 'per_unit' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-100 text-slate-400'
                }`}
              >
                Per Unit
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, paymentModel: 'per_hour'})}
                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  formData.paymentModel === 'per_hour' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-100 text-slate-400'
                }`}
              >
                Per Hour
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Save size={20} /> Create Order
        </button>
      </form>
    </div>
  );
};
