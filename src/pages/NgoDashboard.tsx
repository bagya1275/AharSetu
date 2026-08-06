import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { Donation } from '../types.js';
import { FoodCard } from '../components/FoodCard.js';
import { ClaimFoodModal } from '../components/ClaimFoodModal.js';
import { PdfReceiptModal } from '../components/PdfReceiptModal.js';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Users, 
  ListFilter,
  Sparkles
} from 'lucide-react';

interface NgoDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDonation: (donation: Donation) => void;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({ onNavigate, onSelectDonation }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'claimed' | 'history'>('available');
  const [maxDistance, setMaxDistance] = useState<number>(10); // km radius
  const [loading, setLoading] = useState(true);

  // Modals state
  const [claimDonation, setClaimDonation] = useState<Donation | null>(null);
  const [receiptDonation, setReceiptDonation] = useState<Donation | null>(null);

  const fetchDonations = async () => {
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error('NGO fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleOpenClaimModal = (donation: Donation) => {
    setClaimDonation(donation);
  };

  const handleConfirmClaim = async (
    donation: Donation,
    pickupMethod: 'self_pickup' | 'volunteer',
    pickupNotes?: string
  ) => {
    try {
      const res = await fetch(`/api/donations/${donation.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aharseu_token')}`
        },
        body: JSON.stringify({
          pickupMethod,
          pickupNotes,
          ngoName: user?.organization || user?.name || 'Annam Seva Foundation'
        })
      });

      if (res.ok) {
        showToast(
          'Food Claimed Successfully!',
          pickupMethod === 'self_pickup'
            ? 'Marked for Self Pickup. You can collect directly from donor address.'
            : 'Volunteer Courier Requested. An AharSetu rider will pick up and deliver the food.',
          'success'
        );
        setClaimDonation(null);
        fetchDonations();
        setActiveTab('claimed');
      } else {
        const errData = await res.json();
        showToast('Claim Failed', errData.error || 'Could not claim food post.', 'alert');
      }
    } catch (err) {
      console.error('Claim error', err);
      showToast('Claim Error', 'Server error while claiming food.', 'alert');
    }
  };

  const availableDonations = donations.filter(d => d.status === 'pending');
  const claimedDonations = donations.filter(d => (d.status === 'accepted' || d.status === 'assigned' || d.status === 'picked_up') && (d.ngoId === user?.id || d.ngoName === user?.name || d.ngoName === 'Annam Seva Foundation'));
  const historyDonations = donations.filter(d => d.status === 'delivered' && (d.ngoId === user?.id || d.ngoName === user?.name || d.ngoName === 'Annam Seva Foundation'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* NGO Banner Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 text-xs font-bold border border-blue-400/30">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Verified Non-Profit Organization
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome, {user?.name || user?.organization || 'NGO Partner'}
          </h1>
          {user?.organization && user?.organization !== user?.name && (
            <p className="text-xs text-blue-200 font-semibold">
              Organization: {user.organization}
            </p>
          )}
          <p className="text-xs sm:text-sm text-blue-100/80 max-w-xl">
            Claim nearby hotel and catering surplus meals with 1-click. Select Self-Pickup or request volunteer delivery.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <Building2 className="w-8 h-8 text-blue-400" />
          <div>
            <span className="text-[10px] text-blue-200 block uppercase font-bold">Shelter Location</span>
            <span className="text-xs font-bold text-white">Lajpat Nagar IV, New Delhi</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'available' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Available Nearby Food ({availableDonations.length})
          </button>

          <button
            onClick={() => setActiveTab('claimed')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'claimed' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Claimed / In-Transit ({claimedDonations.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Received History ({historyDonations.length})
          </button>
        </div>

        {/* Radius Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Search Radius:</span>
          <select
            value={maxDistance}
            onChange={e => setMaxDistance(Number(e.target.value))}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-bold"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
          </select>
        </div>
      </div>

      {/* Feed List */}
      <div>
        {activeTab === 'available' && (
          availableDonations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All nearby surplus food has been claimed!</p>
              <p className="text-xs text-slate-500 mt-1">Check back shortly when hotel banquets upload new posts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDonations.map(d => (
                <FoodCard
                  key={d.id}
                  donation={d}
                  onSelect={onSelectDonation}
                  onClaim={handleOpenClaimModal}
                  userRole="ngo"
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'claimed' && (
          claimedDonations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active claimed deliveries right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claimedDonations.map(d => (
                <FoodCard
                  key={d.id}
                  donation={d}
                  onSelect={onSelectDonation}
                  userRole="ngo"
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'history' && (
          historyDonations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No past received history recorded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyDonations.map(d => (
                <FoodCard
                  key={d.id}
                  donation={d}
                  onSelect={onSelectDonation}
                  onPdfReceipt={setReceiptDonation}
                  userRole="ngo"
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Claim Food Modal with Self Pickup vs Volunteer Courier selection */}
      <ClaimFoodModal
        donation={claimDonation}
        onClose={() => setClaimDonation(null)}
        onConfirmClaim={handleConfirmClaim}
      />

      {/* PDF Receipt Modal */}
      <PdfReceiptModal
        donation={receiptDonation}
        onClose={() => setReceiptDonation(null)}
      />

    </div>
  );
};
