import React, { useState, useEffect } from 'react';
import { Donation } from '../types.js';
import { StatusBadge } from './StatusBadge.js';
import { Clock, MapPin, Users, ShieldCheck, ChevronRight, Utensils, Award, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface FoodCardProps {
  donation: Donation;
  onSelect?: (donation: Donation) => void;
  onClaim?: (donation: Donation) => void;
  onAssign?: (donation: Donation) => void;
  onPdfReceipt?: (donation: Donation) => void;
  userRole?: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  donation,
  onSelect,
  onClaim,
  onAssign,
  onPdfReceipt,
  userRole,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(donation.expiryTimestamp).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m left`);
        setIsExpired(false);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [donation.expiryTimestamp]);

  const dietaryBadges = {
    veg: { label: '🟢 Pure Veg', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200' },
    non_veg: { label: '🔴 Non-Veg', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200' },
    vegan: { label: '🌱 Vegan', bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200' },
    jain: { label: '⚪ Jain Compliant', bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200' },
  };

  const dietInfo = dietaryBadges[donation.dietaryType] || dietaryBadges.veg;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 shadow-md hover:shadow-xl transition-shadow flex flex-col overflow-hidden"
    >
      {/* Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={donation.images[0] || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600'}
          alt={donation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs ${dietInfo.bg}`}>
            {dietInfo.label}
          </span>
          <StatusBadge 
            status={donation.status} 
            pickupMethod={donation.pickupMethod}
            volunteerId={donation.volunteerId}
            volunteerName={donation.volunteerName}
            size="sm" 
          />
        </div>

        {/* Expiry Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
          <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-400' : 'text-amber-400'}`} />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{donation.donorOrg || donation.donorName}</span>
            <span>•</span>
            <span className="capitalize">{donation.foodType.replace('_', ' ')}</span>
          </div>

          <h3 
            onClick={() => onSelect && onSelect(donation)}
            className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer line-clamp-1 transition-colors"
          >
            {donation.title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {donation.description}
          </p>
        </div>

        {/* Key Stats Bar */}
        <div className="grid grid-cols-2 gap-2 py-2.5 px-3 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/50 border border-emerald-900/5 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Quantity</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{donation.quantityServings} Meals</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Weight</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{donation.quantityWeightKg || Math.round(donation.quantityServings * 0.35)} kg</span>
            </div>
          </div>
        </div>

        {/* Location Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 min-w-0 pr-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{donation.address}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-1 flex items-center gap-2">
          {(userRole === 'ngo' || userRole === 'requester') && donation.status === 'pending' && (
            <button
              onClick={() => onClaim && onClaim(donation)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Claim Food
            </button>
          )}

          {userRole === 'volunteer' && donation.status === 'accepted' && (
            <button
              onClick={() => onAssign && onAssign(donation)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Accept Delivery Task
            </button>
          )}

          {donation.status === 'delivered' && (
            <button
              type="button"
              onClick={() => onPdfReceipt && onPdfReceipt(donation)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              Receipt (PDF)
            </button>
          )}

          <button
            onClick={() => onSelect && onSelect(donation)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="View Full Details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
