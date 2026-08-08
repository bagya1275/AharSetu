import React, { useState, useEffect } from 'react';
import { User, Donation, DeliveryMethod } from '../types/index.ts';
import { api } from '../services/api.ts';
import { HeartHandshake, CheckCircle2, Plus, Clock, MapPin, Navigation, Bike, Truck } from 'lucide-react';
import { PostDonationModal } from './PostDonationModal.tsx';
import { LiveTrackingModal } from './LiveTrackingModal.tsx';

interface RequesterDashboardProps {
  user: User;
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'available' | 'claims' | 'posted' | 'history'>('available');
  const [availableFood, setAvailableFood] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [postNeedModalOpen, setPostNeedModalOpen] = useState(false);

  const [selectedDonationToClaim, setSelectedDonationToClaim] = useState<Donation | null>(null);
  const [claimMethod, setClaimMethod] = useState<DeliveryMethod>('VOLUNTEER_DELIVERY');
  const [claiming, setClaiming] = useState(false);

  const [trackingDonation, setTrackingDonation] = useState<Donation | null>(null);

  const fetchAvailableFood = () => {
    setLoading(true);
    api.getAvailableDonations()
      .then(res => {
        if (res.success) setAvailableFood(res.donations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAvailableFood();
  }, []);

  const handleClaim = async () => {
    if (!selectedDonationToClaim) return;
    setClaiming(true);
    try {
      const donationId = selectedDonationToClaim.id || selectedDonationToClaim._id!;
      const res = await api.acceptDonation(donationId, claimMethod);
      if (res.success) {
        setSelectedDonationToClaim(null);
        fetchAvailableFood();
      }
    } catch (err) {
      console.error('Claim error:', err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div id="requester_dashboard" data-testid="requester-dashboard" className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-950 via-amber-950 to-slate-950 border border-orange-500/30 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-[11px] font-semibold text-orange-300">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Food Requester & Shelter Portal</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-orange-100/80 text-xs leading-relaxed">
              Claim surplus meals directly or post custom food needs. Choose between Self Pickup or Volunteer Courier Delivery.
            </p>
          </div>

          <button
            id="request_custom_food_btn"
            data-testid="request-custom-food-btn"
            onClick={() => setPostNeedModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs transition shadow-lg shadow-orange-500/20 flex items-center space-x-2 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Request Custom Food Need</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold space-x-2">
        <button
          id="tab_available_surplus"
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
            activeTab === 'available'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/10 rounded-t-lg'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Available Surplus Food ({availableFood.length})
        </button>
        <button
          id="tab_posted_needs"
          onClick={() => setActiveTab('posted')}
          className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
            activeTab === 'posted'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/10 rounded-t-lg'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          My Posted Food Needs
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 min-h-[300px] shadow-sm">
        {loading ? (
          <p className="text-slate-500 dark:text-slate-400 text-xs text-center py-8">Loading available food posts...</p>
        ) : activeTab === 'available' && availableFood.length === 0 ? (
          <div className="space-y-3 max-w-sm py-8 mx-auto text-center">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">No surplus food posts available right now</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Hotel caterers regularly upload new donations. You can also post a direct food request using the button above.</p>
          </div>
        ) : activeTab === 'available' ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {availableFood.map((donation) => (
              <div key={donation.id || donation._id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 hover:border-orange-500/40 transition shadow-sm">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{donation.title}</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">{donation.status}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{donation.description}</p>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Donor: <strong className="text-slate-900 dark:text-white">{donation.donorName}</strong></span>
                  <span>Servings: <strong className="text-orange-600 dark:text-orange-400">{donation.servings} meals</strong></span>
                </div>
                <button
                  onClick={() => setSelectedDonationToClaim(donation)}
                  className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Claim Food Post
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-slate-500 dark:text-slate-400 text-xs text-center">
            Post a custom food need above to receive direct surplus matches from local banquets.
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {selectedDonationToClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 text-slate-900 dark:text-white shadow-2xl">
            <h3 className="font-serif text-lg font-bold">Claim Food Post</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Claiming <strong>{selectedDonationToClaim.title}</strong> ({selectedDonationToClaim.servings} meals). Select delivery method:
            </p>

            <div className="space-y-2">
              <label 
                onClick={() => setClaimMethod('VOLUNTEER_DELIVERY')}
                className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer ${
                  claimMethod === 'VOLUNTEER_DELIVERY' ? 'bg-orange-500/10 border-orange-500 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Bike className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-bold text-xs">Request Express Volunteer Courier</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Dispatch a volunteer rider to collect and deliver directly to your shelter.</p>
                </div>
              </label>

              <label 
                onClick={() => setClaimMethod('SELF_PICKUP')}
                className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer ${
                  claimMethod === 'SELF_PICKUP' ? 'bg-orange-500/10 border-orange-500 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Truck className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-bold text-xs">Self-Pickup</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Collect directly from the donor location.</p>
                </div>
              </label>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                id="confirm_claim_food_btn"
                onClick={handleClaim}
                disabled={claiming}
                className="flex-1 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold py-2 rounded-xl text-xs cursor-pointer shadow-md"
              >
                {claiming ? 'Processing...' : 'Confirm Claim'}
              </button>
              <button
                onClick={() => setSelectedDonationToClaim(null)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Custom Need Modal */}
      <PostDonationModal
        isOpen={postNeedModalOpen}
        onClose={() => setPostNeedModalOpen(false)}
        onDonationCreated={() => {
          setPostNeedModalOpen(false);
          fetchAvailableFood();
        }}
        isRequesterNeed={true}
      />

      {/* Live Tracking Map Modal */}
      <LiveTrackingModal
        isOpen={!!trackingDonation}
        onClose={() => setTrackingDonation(null)}
        donation={trackingDonation}
      />
    </div>
  );
};

