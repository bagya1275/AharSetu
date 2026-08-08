import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { Donation, FoodNeedRequest } from '../types.js';
import { FoodCard } from '../components/FoodCard.js';
import { ClaimFoodModal } from '../components/ClaimFoodModal.js';
import { PdfReceiptModal } from '../components/PdfReceiptModal.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { 
  HeartHandshake, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  UserCheck, 
  FileText,
  AlertCircle,
  ShieldCheck,
  X
} from 'lucide-react';

interface RequesterDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDonation: (donation: Donation) => void;
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({ onNavigate, onSelectDonation }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [foodRequests, setFoodRequests] = useState<FoodNeedRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'direct_requests' | 'claims' | 'history'>('available');
  const [loading, setLoading] = useState(true);

  // Claim modal state
  const [claimDonation, setClaimDonation] = useState<Donation | null>(null);
  const [receiptDonation, setReceiptDonation] = useState<Donation | null>(null);

  // Direct Food Need Request modal state
  const [isPostNeedModalOpen, setIsPostNeedModalOpen] = useState(false);
  const [needTitle, setNeedTitle] = useState('');
  const [servingsNeeded, setServingsNeeded] = useState<number>(30);
  const [dietaryPreference, setDietaryPreference] = useState<'veg' | 'non_veg' | 'vegan' | 'jain'>('veg');
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'normal'>('high');
  const [needNotes, setNeedNotes] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        fetch('/api/donations'),
        fetch('/api/food-requests')
      ]);

      if (donationsRes.ok) {
        const dData = await donationsRes.json();
        setDonations(dData.donations || []);
      }

      if (requestsRes.ok) {
        const rData = await requestsRes.json();
        setFoodRequests(rData.requests || []);
      }
    } catch (err) {
      console.error('Requester dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
          ngoName: user?.organization || user?.name || 'Community Shelter'
        })
      });

      if (res.ok) {
        showToast(
          'Food Claimed Successfully!',
          pickupMethod === 'self_pickup'
            ? 'Marked for Self Pickup. You can collect directly from the donor address.'
            : 'Volunteer Delivery Requested. An AharSetu rider will be assigned shortly.',
          'success'
        );
        setClaimDonation(null);
        fetchDashboardData();
        setActiveTab('claims');
      } else {
        const errData = await res.json();
        showToast('Claim Failed', errData.error || 'Could not claim food post.', 'alert');
      }
    } catch (err) {
      console.error('Claim error', err);
      showToast('Claim Error', 'Server connection error.', 'alert');
    }
  };

  const handlePostFoodNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/food-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aharseu_token')}`
        },
        body: JSON.stringify({
          title: needTitle,
          servingsNeeded,
          dietaryPreference,
          urgency,
          notes: needNotes,
          address: user?.address || 'New Delhi, India',
          organizationName: user?.organization || user?.name || 'Shelter Home'
        })
      });

      if (res.ok) {
        showToast('Need Posted!', 'Your food request is now live for nearby donors and caterers.', 'success');
        setIsPostNeedModalOpen(false);
        setNeedTitle('');
        setNeedNotes('');
        fetchDashboardData();
        setActiveTab('direct_requests');
      }
    } catch (err) {
      console.error('Post need error', err);
      showToast('Posting Failed', 'Could not save food requirement.', 'alert');
    }
  };

  const availableDonations = donations.filter(d => d.status === 'pending');
  const myClaims = donations.filter(
    d =>
      (d.status === 'accepted' || d.status === 'assigned' || d.status === 'picked_up') &&
      (d.ngoId === user?.id || d.ngoName === user?.organization || d.ngoName === user?.name)
  );
  const myHistory = donations.filter(
    d =>
      d.status === 'delivered' &&
      (d.ngoId === user?.id || d.ngoName === user?.organization || d.ngoName === user?.name)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Requester Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-900 via-amber-900 to-slate-900 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 backdrop-blur-md text-orange-300 text-xs font-bold border border-orange-400/30">
            <HeartHandshake className="w-4 h-4 text-orange-400" />
            Food Requester & Shelter Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.name || user?.organization || 'Beneficiary Shelter'}
          </h1>
          {user?.organization && user?.organization !== user?.name && (
            <p className="text-xs text-orange-200 font-semibold">
              Organization: {user.organization}
            </p>
          )}
          <p className="text-xs sm:text-sm text-orange-100/80 max-w-xl">
            Claim surplus meals directly or post custom food needs. Choose between <strong>Self Pickup</strong> or <strong>Volunteer Courier Delivery</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setIsPostNeedModalOpen(true)}
            className="py-3 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Request Custom Food Need
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'available'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Available Surplus Food ({availableDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Active Food Claims ({myClaims.length})
        </button>

        <button
          onClick={() => setActiveTab('direct_requests')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'direct_requests'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          My Posted Food Needs ({foodRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Received History & PDF Receipts ({myHistory.length})
        </button>
      </div>

      {/* Tab 1: Available Food */}
      {activeTab === 'available' && (
        availableDonations.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No surplus food posts available right now</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hotel caterers regularly upload new donations. You can also post a direct food request using the button above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDonations.map(d => (
              <FoodCard
                key={d.id}
                donation={d}
                onSelect={onSelectDonation}
                onClaim={handleOpenClaimModal}
                userRole="requester"
              />
            ))}
          </div>
        )
      )}

      {/* Tab 2: Active Claims & Logistics */}
      {activeTab === 'claims' && (
        myClaims.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Clock className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">You have no active claimed food orders.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClaims.map(d => (
              <div key={d.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{d.title}</span>
                  <StatusBadge 
                    status={d.status} 
                    pickupMethod={d.pickupMethod}
                    volunteerId={d.volunteerId}
                    volunteerName={d.volunteerName}
                    size="sm" 
                  />
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Delivery Method:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {d.pickupMethod === 'self_pickup' ? '🚶 Self Pickup' : '🚚 Volunteer Courier'}
                    </span>
                  </div>

                  {/* Status Banner */}
                  {d.pickupMethod === 'volunteer' && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      {(!d.volunteerId && !d.volunteerName) ? (
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold">
                          <Clock className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                          <span>Status: Waiting for volunteer acceptance</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              {d.status === 'delivered' 
                                ? 'Status: Food Delivered Successfully' 
                                : d.status === 'picked_up' 
                                ? 'Status: Food Picked Up - En Route (In Transit)' 
                                : 'Status: Will be picked up by a volunteer'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Rider: <strong className="text-slate-800 dark:text-slate-200">{d.volunteerName}</strong> ({d.volunteerPhone || 'Verified Carrier'})
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Donor:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{d.donorOrg || d.donorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Servings:</span>
                    <span className="font-semibold text-emerald-600">{d.quantityServings} Meals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pickup Address:</span>
                    <span className="font-semibold truncate max-w-[180px]">{d.address}</span>
                  </div>
                  {d.pickupNotes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] italic">
                      Notes: "{d.pickupNotes}"
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectDonation(d)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  View Live Logistics Map & Rider Tracking
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 3: Direct Requests */}
      {activeTab === 'direct_requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Food Need Requests</h3>
            <button
              onClick={() => setIsPostNeedModalOpen(true)}
              className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Post New Need
            </button>
          </div>

          {foodRequests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <AlertCircle className="w-10 h-10 text-orange-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No direct food requirement requests posted yet.</p>
              <p className="text-xs text-slate-500">Post a need so donors know exact meal quantities required by your shelter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foodRequests.map(req => (
                <div key={req.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{req.title}</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-xs font-bold">
                      {req.servingsNeeded} Servings Needed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="block text-slate-400 text-[10px] uppercase font-bold">Organization</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{req.organizationName}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px] uppercase font-bold">Dietary</span>
                      <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{req.dietaryPreference}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px] uppercase font-bold">Urgency</span>
                      <span className="font-semibold text-red-600 capitalize">{req.urgency}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px] uppercase font-bold">Status</span>
                      <span className="font-semibold text-emerald-600 capitalize">{req.status}</span>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                      "{req.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: History & PDF Receipts */}
      {activeTab === 'history' && (
        myHistory.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No completed food deliveries recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myHistory.map(d => (
              <FoodCard
                key={d.id}
                donation={d}
                onSelect={onSelectDonation}
                onPdfReceipt={setReceiptDonation}
                userRole="requester"
              />
            ))}
          </div>
        )
      )}

      {/* Claim Food Modal */}
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

      {/* Post Direct Need Modal */}
      {isPostNeedModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md cursor-pointer animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPostNeedModalOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 cursor-default relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Post Custom Food Need</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPostNeedModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostFoodNeed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">Title / Food Description Required</label>
                <input
                  type="text"
                  required
                  value={needTitle}
                  onChange={e => setNeedTitle(e.target.value)}
                  placeholder="e.g. Need 40 Rice & Curry Servings for Evening Distribution"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">Servings Needed</label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={servingsNeeded}
                    onChange={e => setServingsNeeded(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">Dietary Type</label>
                  <select
                    value={dietaryPreference}
                    onChange={e => setDietaryPreference(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non_veg">Non-Vegetarian</option>
                    <option value="jain">Jain</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1">Special Notes / Timing</label>
                <textarea
                  rows={2}
                  value={needNotes}
                  onChange={e => setNeedNotes(e.target.value)}
                  placeholder="e.g. Please inform 1 hour prior to arrival so children are ready."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Publish Food Request
                </button>
                <button
                  type="button"
                  onClick={() => setIsPostNeedModalOpen(false)}
                  className="py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
