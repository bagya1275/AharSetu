import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { Donation } from '../types.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Upload, 
  ShieldCheck, 
  Navigation, 
  Phone, 
  Camera, 
  Clock, 
  Users,
  Award,
  Sparkles
} from 'lucide-react';

interface VolunteerDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDonation: (donation: Donation) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ onNavigate, onSelectDonation }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTask, setActiveTask] = useState<Donation | null>(null);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  
  const [proofImage, setProofImage] = useState('');
  const [deliveryProofImage, setDeliveryProofImage] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [recipientCount, setRecipientCount] = useState<number>(50);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        const list: Donation[] = data.donations || [];
        setDonations(list);
        
        // Active assigned or picked_up task for volunteer
        const assigned = list.find(d => (d.status === 'assigned' || d.status === 'picked_up' || d.status === 'accepted') && (d.volunteerId === user?.id || d.volunteerName === user?.name));
        setActiveTask(assigned || null);
      }
    } catch (err) {
      console.error('Fetch volunteer tasks error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleMarkPickup = async () => {
    if (!activeTask) return;
    try {
      const res = await fetch(`/api/donations/${activeTask.id}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofImage, pickupNotes: notes || 'Food inspected & safely picked up.' })
      });
      if (res.ok) {
        showToast('Pickup Confirmed!', 'In transit to delivery destination.', 'success');
        setIsPickupModalOpen(false);
        fetchTasks();
      }
    } catch (err) {
      console.error('Pickup mark error', err);
    }
  };

  const handleMarkDelivery = async () => {
    if (!activeTask) return;
    if (!deliveryProofImage) {
      showToast('Photo Required', 'Please upload a delivery handover proof photo before completing delivery.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/donations/${activeTask.id}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deliveryProof: deliveryProofImage, 
          deliveryNotes: deliveryNotes || 'Handed over to recipient coordinator.', 
          recipientCount 
        })
      });
      if (res.ok) {
        showToast('Delivery Completed! 🎉', `You helped feed ${recipientCount} people!`, 'success');
        setIsDeliverModalOpen(false);
        setDeliveryProofImage('');
        setDeliveryNotes('');
        fetchTasks();
      }
    } catch (err) {
      console.error('Delivery mark error', err);
    }
  };

  const handleAcceptTask = async (donation: Donation) => {
    try {
      const res = await fetch(`/api/donations/${donation.id}/assign-volunteer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aharseu_token')}`
        },
        body: JSON.stringify({
          volunteerId: user?.id || 'usr_vol_current',
          volunteerName: user?.name || 'AharSetu Volunteer Courier',
          volunteerPhone: user?.phone || '+91 98765 43210'
        })
      });

      if (res.ok) {
        showToast('Delivery Task Accepted! 🚚', 'You have been assigned to pick up this food donation.', 'success');
        fetchTasks();
      } else {
        const err = await res.json();
        showToast('Acceptance Failed', err.error || 'Could not accept pickup task.', 'alert');
      }
    } catch (err) {
      console.error('Accept task error', err);
      showToast('Error', 'Server connection error.', 'alert');
    }
  };

  const completedDeliveries = donations.filter(d => d.status === 'delivered' && (d.volunteerId === user?.id || d.volunteerName === user?.name));
  const pendingPickupRequests = donations.filter(d => 
    (d.status === 'accepted' || d.status === 'pending') &&
    (d.pickupMethod === 'volunteer' || !d.pickupMethod) &&
    (!d.volunteerId || d.volunteerId === '')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-400/30">
            <Truck className="w-4 h-4 text-amber-300" />
            Active Delivery Rider
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome, {user?.name || 'Volunteer Hero'}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/80 max-w-xl">
            Pick up fresh food from donor caterers and transport safely to community shelters using live route maps.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0 text-center">
          <Award className="w-6 h-6 text-amber-300 mx-auto mb-1" />
          <span className="text-[10px] text-amber-200 block uppercase font-bold">Deliveries Completed</span>
          <span className="text-xl font-extrabold text-white">{completedDeliveries.length} Runs</span>
        </div>
      </div>

      {/* Active Task Navigation View */}
      {activeTask ? (
        <div className="bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Current Assigned Mission
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {activeTask.title}
              </h2>
            </div>
            <StatusBadge status={activeTask.status} size="lg" />
          </div>



          {/* Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Donor Pickup Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">STEP 1: PICKUP LOCATION</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{activeTask.donorOrg || activeTask.donorName}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {activeTask.address}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                Contact: {activeTask.donorPhone}
              </p>
            </div>

            {/* Dropoff Destination Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">STEP 2: DROP-OFF DESTINATION</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{activeTask.ngoName || 'Recipient / Shelter'}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Lajpat Nagar IV Shelter, New Delhi
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                Contact: {activeTask.ngoPhone || '+91 99887 76655'}
              </p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {activeTask.status === 'assigned' || activeTask.status === 'accepted' ? (
              <button
                onClick={() => setIsPickupModalOpen(true)}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                Mark Food Picked Up (Upload Proof)
              </button>
            ) : (
              <button
                onClick={() => setIsDeliverModalOpen(true)}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirm Food Delivery
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Truck className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No active delivery task assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You will receive a notification as soon as recipient food claims are available in your vicinity.
          </p>
        </div>
      )}

      {/* Available Delivery Requests for Volunteers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              Available Delivery Pickup Requests ({pendingPickupRequests.length})
            </h3>
            <p className="text-xs text-slate-500">
              Pending requests looking for a volunteer courier to collect and deliver food.
            </p>
          </div>
        </div>

        {pendingPickupRequests.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No food available for pickup right now</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All active delivery requests have been assigned. Check back shortly for new claims!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingPickupRequests.map(d => (
              <div key={d.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{d.title}</span>
                    <StatusBadge status={d.status} pickupMethod={d.pickupMethod} volunteerId={d.volunteerId} size="sm" />
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Servings:</span>
                      <span className="font-bold text-emerald-600">{d.quantityServings} Meals</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">1. Pickup Address (Donor):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{d.donorOrg || d.donorName}</span>
                      <p className="text-slate-500 truncate">{d.address}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">2. Dropoff Destination (Shelter):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{d.ngoName || 'Beneficiary Relief Shelter'}</span>
                    </div>
                    {d.pickupNotes && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] italic">
                        Notes: "{d.pickupNotes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={() => handleAcceptTask(d)}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    Accept Delivery Task
                  </button>
                  <button
                    onClick={() => onSelectDonation(d)}
                    className="py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    title="View details / map"
                  >
                    <MapPin className="w-4 h-4 text-orange-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isPickupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Upload Pickup Proof Photo</h3>
            <p className="text-xs text-slate-500">Attach inspection photo showing thermal container / packed food box.</p>

            {/* Interactive Image Upload Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Pickup Photo Proof</label>
              {proofImage ? (
                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={proofImage} alt="Pickup Proof" className="w-full h-44 object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                      Replace Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) setProofImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setProofImage('')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full h-44 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors group">
                  <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to upload or drag photo here</span>
                  <span className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG or WebP images</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) setProofImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}

              {/* Sample Photo Preset helper */}
              {!proofImage && (
                <button
                  type="button"
                  onClick={() => setProofImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400')}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium pt-1"
                >
                  <Sparkles className="w-3 h-3" /> Use sample inspection photo for quick testing
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pickup Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Temperature checked at 65C. Food safely packed."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleMarkPickup}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Confirm Pickup
              </button>
              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Proof Modal */}
      {isDeliverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Confirm Food Delivery Handover</h3>
              <p className="text-xs text-slate-500 mt-0.5">Attach handover photo proving successful delivery to recipient.</p>
            </div>

            {/* Interactive Image Upload Section for Delivery */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Delivery Handover Photo Proof <span className="text-rose-500">*</span>
              </label>
              {deliveryProofImage ? (
                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={deliveryProofImage} alt="Delivery Handover Proof" className="w-full h-44 object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                      Replace Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) setDeliveryProofImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setDeliveryProofImage('')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors group">
                  <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to upload or drag handover photo here</span>
                  <span className="text-[10px] text-slate-400 mt-1">Proof of food distribution / recipient handover</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) setDeliveryProofImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}

              {/* Sample Photo Preset helper */}
              {!deliveryProofImage && (
                <button
                  type="button"
                  onClick={() => setDeliveryProofImage('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400')}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium pt-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Use sample handover photo for quick testing
                </button>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Number of Recipients Fed</label>
              <input
                type="number"
                value={recipientCount}
                onChange={e => setRecipientCount(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Coordinator / Handover Notes</label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={e => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Handed over to recipient coordinator at destination."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleMarkDelivery}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Complete Mission
              </button>
              <button
                onClick={() => setIsDeliverModalOpen(false)}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
