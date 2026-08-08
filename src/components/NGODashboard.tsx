import React, { useState, useEffect } from 'react';
import { User, Donation, DeliveryMethod } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ShieldCheck, Building, CheckCircle2, MapPin, Truck, Bike, Clock, ChevronDown, Navigation } from 'lucide-react';
import { LiveTrackingModal } from './LiveTrackingModal.tsx';

interface NGODashboardProps {
  user: User;
}

export const NGODashboard: React.FC<NGODashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'available' | 'claimed' | 'history'>('available');
  const [availableFood, setAvailableFood] = useState<Donation[]>([]);
  const [myClaims, setMyClaims] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [claimMethod, setClaimMethod] = useState<DeliveryMethod>('VOLUNTEER_DELIVERY');
  const [claiming, setClaiming] = useState(false);

  const [trackingDonation, setTrackingDonation] = useState<Donation | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availRes, claimsRes] = await Promise.all([
        api.getAvailableDonations(),
        api.getNGOClaims()
      ]);

      if (availRes.success) setAvailableFood(availRes.donations || []);
      if (claimsRes.success) setMyClaims(claimsRes.donations || []);
    } catch (err) {
      console.error('Failed to load NGO dashboard data:', err);
    } fontinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimDonation = async () => {
    if (!selectedDonation) return;
    setClaiming(true);

    try {
      const res = await api.acceptDonation(selectedDonation.id || selectedDonation._id!, claimMethod);
      if (res.success) {
        setSelectedDonation(null);
        fetchData();
      }
    } catch (err) {
      console.error('Claim error:', err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div id="ngo_dashboard" data-testid="ngo-dashboard" className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 border border-blue-500/30 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-[11px] font-semibold text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Non-Profit Organization</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-blue-100/80 text-xs leading-relaxed">
              Claim nearby hotel and catering surplus meals with 1-click. Select Self-Pickup or request volunteer delivery.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex items-center space-x-3 text-xs flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shelter Location</p>
              <p className="font-bold text-white">{user.shelterLocation || 'Lajpat Nagar IV, New Delhi'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex space-x-2 text-xs font-semibold">
          <button
            id="tab_available_food"
            data-testid="tab-available-food"
            onClick={() => setActiveTab('available')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10 rounded-t-lg'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Available Nearby Food ({availableFood.length})
          </button>
          <button
            id="tab_claimed_food"
            data-testid="tab-claimed-food"
            onClick={() => setActiveTab('claimed')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'claimed'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10 rounded-t-lg'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Claimed / In-Transit ({myClaims.length})
          </button>
          <button
            id="tab_received_history"
            data-testid="tab-received-history"
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10 rounded-t-lg'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Received History (0)
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Search Radius:</span>
          <select 
            id="select_search_radius"
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-2.5 py-1 text-xs outline-none"
          >
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 min-h-[300px] flex flex-col items-center justify-center text-center shadow-sm">
        {loading ? (
          <p className="text-slate-500 dark:text-slate-400 text-xs">Checking nearby surplus food posts...</p>
        ) : activeTab === 'available' && availableFood.length === 0 ? (
          <div className="space-y-3 max-w-sm py-8">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">All nearby surplus food has been claimed!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Check back shortly when hotel banquets upload new posts.</p>
          </div>
        ) : activeTab === 'available' ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {availableFood.map((donation) => (
              <div 
                key={donation.id || donation._id} 
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 hover:border-blue-500/50 transition flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Fresh Surplus
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>Expires in {donation.expiryHours}h</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{donation.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{donation.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Donor: <strong className="text-slate-900 dark:text-white">{donation.donorName}</strong></span>
                    <span>Servings: <strong className="text-emerald-600 dark:text-emerald-400">{donation.servings} meals</strong></span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{donation.pickupAddress}</span>
                  </div>
                </div>

                <button
                  id={`claim_btn_${donation.id || donation._id}`}
                  data-testid="claim-food-btn"
                  onClick={() => setSelectedDonation(donation)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs transition shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Claim Food Donation Now
                </button>
              </div>
            ))}
          </div>
        ) : activeTab === 'claimed' && myClaims.length > 0 ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {myClaims.map((donation) => (
              <div key={donation.id || donation._id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{donation.title}</h4>
                  <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase">{donation.status}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">Donor: {donation.donorName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Method: {donation.deliveryMethod || 'VOLUNTEER_DELIVERY'}</p>
                
                <button
                  onClick={() => setTrackingDonation(donation)}
                  className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 font-bold py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>View Live GPS Route Map</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-slate-500 dark:text-slate-400 text-xs">
            No claims recorded in this tab.
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 text-slate-900 dark:text-white shadow-2xl">
            <h3 className="font-serif text-lg font-bold">Claim Food Post</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Claiming <strong>{selectedDonation.title}</strong> ({selectedDonation.servings} meals). Select pickup preference:
            </p>

            <div className="space-y-2">
              <label 
                onClick={() => setClaimMethod('VOLUNTEER_DELIVERY')}
                className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer ${
                  claimMethod === 'VOLUNTEER_DELIVERY' ? 'bg-blue-500/10 border-blue-500 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Bike className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-bold text-xs">Request Volunteer Courier Delivery</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Dispatch an express volunteer rider to pick up and deliver directly to your shelter.</p>
                </div>
              </label>

              <label 
                onClick={() => setClaimMethod('SELF_PICKUP')}
                className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer ${
                  claimMethod === 'SELF_PICKUP' ? 'bg-blue-500/10 border-blue-500 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Truck className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-bold text-xs">Self-Pickup by NGO Team</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Your NGO team will send a vehicle directly to the donor location.</p>
                </div>
              </label>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                id="confirm_claim_btn"
                onClick={handleClaimDonation}
                disabled={claiming}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer shadow-md"
              >
                {claiming ? 'Processing...' : 'Confirm Claim'}
              </button>
              <button
                onClick={() => setSelectedDonation(null)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Live Tracking Modal */}
      <LiveTrackingModal
        isOpen={!!trackingDonation}
        onClose={() => setTrackingDonation(null)}
        donation={trackingDonation}
      />
    </div>
  );
};
