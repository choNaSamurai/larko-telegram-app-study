import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Hash, Users, Calendar, CreditCard, ChevronDown } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useHaptic } from '../hooks/useHaptic';
import { useTelegram } from '../hooks/useTelegram';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const { impact, notification } = useHaptic();
  const { tg } = useTelegram();
  const queryClient = useQueryClient();

  const { data: productTypes = [] } = useQuery({
    queryKey: ['productTypes'],
    queryFn: () => dataService.getProductTypes().then(res => res.data || [])
  });

  const { data: workers = [] } = useQuery({
    queryKey: ['workers'],
    queryFn: () => dataService.getWorkers().then(res => res.data || [])
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => dataService.createOrder(orderData),
    onSuccess: () => {
      notification('success');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/admin/orders');
    },
    onError: (error: any) => {
      notification('error');
      console.error('Error creating order:', error);
    }
  });

  const loading = createOrderMutation.isPending;

  const [formData, setFormData] = useState({
    orderNumber: '',
    productType: '',
    quantity: 1,
    deadline: '',
    workerId: '',
    paymentModel: 'per_unit',
    notes: ''
  });

  // Fetches are handled by useQuery

  useEffect(() => {
    if (tg.mainButton) {
      tg.mainButton.setParams({
        text: 'COMMIT TASK',
        isVisible: true,
        isEnabled: !loading,
        isLoaderVisible: loading
      });

      const offClick = tg.mainButton.onClick(() => {
        handleSubmit(new Event('submit') as any);
      });

      return () => {
        offClick();
        tg.mainButton.setParams({ isVisible: false });
      };
    }
  }, [tg.mainButton, loading, formData]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    createOrderMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 text-left pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors p-2 -ml-2 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Hub</span>
      </button>

      <div className="px-2">
        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">NEW PRODUCTION</h2>
        <p className="text-[var(--text-secondary)] font-medium mt-1 uppercase tracking-widest text-[10px]">Assign task to fleet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="premium-card bg-[var(--bg-secondary)] border-none !p-8 space-y-8">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
              <Hash size={12} strokeWidth={3} /> ORDER IDENTITY <span className="opacity-30">(#HEX)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. #1024"
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              className="w-full h-14 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-2xl p-4 font-black text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-glow)] transition-all outline-none uppercase tracking-widest"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                <ShoppingBag size={12} strokeWidth={3} /> TASK TYPE
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full h-14 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-2xl p-4 font-black text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-glow)] transition-all outline-none appearance-none cursor-pointer uppercase tracking-widest"
                >
                  <option value="" className="bg-[var(--bg-secondary)]">SELECT...</option>
                  {productTypes.map((pt: any) => <option key={pt.id} value={pt.id} className="bg-[var(--bg-secondary)]">{pt.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" size={16} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">QUANTITY</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full h-14 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-2xl p-4 font-mono-numbers text-lg font-black text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-glow)] transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
              <Users size={12} strokeWidth={3} /> STATION SPECIALIST
            </label>
            <div className="relative">
              <select
                required
                value={formData.workerId}
                onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                className="w-full h-14 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-2xl p-4 font-black text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-glow)] transition-all outline-none appearance-none cursor-pointer uppercase tracking-widest"
              >
                <option value="" className="bg-[var(--bg-secondary)]">SELECT SPECIALIST...</option>
                {workers.map((w: any) => <option key={w.id} value={w.id} className="bg-[var(--bg-secondary)]">{w.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" size={16} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
              <Calendar size={12} strokeWidth={3} /> DEADLINE TARGET
            </label>
            <input
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full h-14 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-2xl p-4 font-mono-numbers text-lg font-black text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-glow)] transition-all outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
              <CreditCard size={12} strokeWidth={3} /> PAYMENT MODEL
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  impact('light');
                  setFormData({ ...formData, paymentModel: 'per_unit' });
                }}
                className={`h-14 rounded-2xl border-2 font-black text-[10px] tracking-[0.2em] transition-all uppercase ${formData.paymentModel === 'per_unit'
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}
              >
                PER UNIT
              </button>
              <button
                type="button"
                onClick={() => {
                  impact('light');
                  setFormData({ ...formData, paymentModel: 'per_hour' });
                }}
                className={`h-14 rounded-2xl border-2 font-black text-[10px] tracking-[0.2em] transition-all uppercase ${formData.paymentModel === 'per_hour'
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}
              >
                PER HOUR
              </button>
            </div>
          </div>
        </div>

        {/* Hide manual button as MainButton is used */}
        <div className="h-16" />
      </form>
    </div>
  );
};
