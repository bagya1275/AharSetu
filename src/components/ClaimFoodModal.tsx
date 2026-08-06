import React, { useState, useEffect } from 'react';
import { Donation } from '../types.js';
import { X, Truck, UserCheck, MapPin, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClaimFoodModalProps {
  donation: Donation | null;
  onClose: () => void;
  onConfirmClaim: (donation: Donation, pickupMethod: 'self_pickup' | 'volunteer', pickupNotes?: string) => void;
}

export const ClaimFoodModal: React.FC<ClaimFoodModalProps> = ({
  donation,
  onClose,
  onConfirmClaim,
}) => {
  const [pickupMethod, setPickupMethod] = useState<'self_pickup' | 'volunteer'>('volunteer');
  const [pickupNotes, setPickupNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (donation) {
        onConfirmClaim(donation, pickupMethod, pickupNotes);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {donation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 relative overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Claim Food Portion</h3>
              <p className="text-xs text-slate-500">Choose pickup or volunteer courier delivery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Donation Brief Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{donation.title}</h4>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {donation.quantityServings} Servings
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              {donation.address}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {donation.expiryHours}h remaining
            </span>
          </div>
        </div>

        {/* Form Selection */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-2">
              Select Fulfillment & Logistics Method:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Self Pickup */}
              <button
                type="button"
                onClick={() => setPickupMethod('self_pickup')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  pickupMethod === 'self_pickup'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="pickupMethod"
                    checked={pickupMethod === 'self_pickup'}
                    onChange={() => setPickupMethod('self_pickup')}
                    className="accent-emerald-600"
                  />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">Self Pickup by Requester</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    You or your team will pick up food directly from donor address.
                  </p>
                </div>
              </button>

              {/* Option 2: Request Volunteer */}
              <button
                type="button"
                onClick={() => setPickupMethod('volunteer')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  pickupMethod === 'volunteer'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    <Truck className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="pickupMethod"
                    checked={pickupMethod === 'volunteer'}
                    onChange={() => setPickupMethod('volunteer')}
                    className="accent-blue-600"
                  />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">Assign Delivery Volunteer</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Request an AharSetu volunteer rider to collect and deliver food.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">
              Pickup Instructions / ETA Notes (Optional)
            </label>
            <input
              type="text"
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder={
                pickupMethod === 'self_pickup'
                  ? 'e.g. Arriving at 6:30 PM in white van'
                  : 'e.g. Please deliver to backgate of Lajpat Nagar Shelter'
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                pickupMethod === 'self_pickup'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span>
                {pickupMethod === 'self_pickup'
                  ? 'Confirm Claim (Self Pickup)'
                  : 'Confirm Claim (Request Volunteer)'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
