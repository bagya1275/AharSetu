import React, { useState, useEffect } from 'react';
import { User, Donation } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Bike, ShieldCheck, Award, CheckCircle2, MapPin, Truck, Clock, Camera, Upload, X, Navigation } from 'lucide-react';
import { LiveTrackingModal } from './LiveTrackingModal.tsx';

interface VolunteerDashboardProps {
  user: User;
}

const proofPhotoTemplates = [
  { id: 'p1', label: 'Thermal Food Carrier Box', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80' },
  { id: 'p2', label: 'Packed Hot Meal Containers', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
  { id: 'p3', label: 'Delivery Vehicle Loading', url: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80' },
  { id: 'p4', label: 'Shelter Handover Receipt', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80' }
];

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ user }) => {
  const [availableForPickup, setAvailableForPickup] = useState<Donation[]>([]);
  const [myTasks, setMyTasks] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Proof Modal state
  const [activeProofModal, setActiveProofModal] = useState<'pickup' | 'delivery' | null>(null);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState<Donation | null>(null);
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string>(proofPhotoTemplates[0].url);
  const [customPhotoInput, setCustomPhotoInput] = useState<string>('');
  const [submittingProof, setSubmittingProof] = useState(false);

  // Live Tracking Modal state
  const [trackingTask, setTrackingTask] = useState<Donation | null>(null);

  const fetchVolunteerTasks = async () => {
    try {
      const res = await api.getVolunteerTasks();
      if (res.success) {
        setAvailableForPickup(res.availableForPickup || []);
        setMyTasks(res.myTasks || []);
      }
    } catch (err) {
      console.error('Failed to load volunteer tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerTasks();
  }, []);

  const openPickupProofModal = (task: Donation) => {
    setSelectedTaskForProof(task);
    setProofPhotoUrl(proofPhotoTemplates[0].url);
    setCustomPhotoInput('');
    setActiveProofModal('pickup');
  };

  const openDeliveryProofModal = (task: Donation) => {
    setSelectedTaskForProof(task);
    setProofPhotoUrl(proofPhotoTemplates[3].url);
    setCustomPhotoInput('');
    setActiveProofModal('delivery');
  };

  const handleConfirmPickupProof = async () => {
    if (!selectedTaskForProof) return;
    setSubmittingProof(true);
    const finalPhoto = customPhotoInput.trim() || proofPhotoUrl;

    try {
      const taskId = selectedTaskForProof.id || selectedTaskForProof._id!;
      const res = await api.updateStatus(taskId, 'IN_TRANSIT', { pickupProofUrl: finalPhoto });
      if (res.success) {
        setActiveProofModal(null);
        setSelectedTaskForProof(null);
        fetchVolunteerTasks();
      }
    } catch (err) {
      console.error('Pickup proof error:', err);
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleConfirmDeliveryProof = async () => {
    if (!selectedTaskForProof) return;
    setSubmittingProof(true);
    const finalPhoto = customPhotoInput.trim() || proofPhotoUrl;

    try {
      const taskId = selectedTaskForProof.id || selectedTaskForProof._id!;
      const res = await api.updateStatus(taskId, 'DELIVERED', { deliveryProofUrl: finalPhoto });
      if (res.success) {
        setActiveProofModal(null);
        setSelectedTaskForProof(null);
        fetchVolunteerTasks();
      }
    } catch (err) {
      console.error('Delivery proof error:', err);
    } finally {
      setSubmittingProof(false);
    }
  };

  const completedCount = myTasks.filter(t => t.status === 'DELIVERED').length;

  return (
    <div id="volunteer_dashboard" data-testid="volunteer-dashboard" className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-yellow-950 to-slate-950 border border-amber-500/30 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-[11px] font-semibold text-amber-300">
              <Bike className="w-3.5 h-3.5" />
              <span>Active Delivery Rider</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-amber-100/80 text-xs leading-relaxed">
              Pick up fresh food from donor caterers, upload pickup & handover proof photos, and transport safely using live route maps.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 flex flex-col items-center justify-center text-center flex-shrink-0 min-w-[160px]">
            <Award className="w-6 h-6 text-amber-400 mb-1" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Deliveries Completed</p>
            <p className="text-2xl font-bold text-white">{completedCount} Runs</p>
          </div>
        </div>
      </div>

      {/* Card 1: Active Delivery Task Assigned */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 min-h-[160px] shadow-sm">
        {myTasks.filter(t => t.status === 'IN_TRANSIT').length > 0 ? (
          <div className="w-full space-y-4 text-left">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center space-x-2">
              <Bike className="w-4 h-4" />
              <span>Active Transit Task</span>
            </h3>
            {myTasks.filter(t => t.status === 'IN_TRANSIT').map((task) => (
              <div key={task.id || task._id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{task.title}</h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-bold">In Transit</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pickup: {task.pickupAddress}</span>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Deliver to: {task.acceptedByNGO?.ngoName || task.requesterName || 'Delivery Destination'}
                  </p>
                  {task.pickupProofUrl && (
                    <div className="pt-2 flex items-center space-x-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pickup Proof Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setTrackingTask(task)}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-300 border border-slate-200 dark:border-slate-700 font-bold px-3 py-2 rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Live GPS Map</span>
                  </button>

                  <button
                    id={`confirm_delivery_btn_${task.id || task._id}`}
                    data-testid="confirm-delivery-btn"
                    onClick={() => openDeliveryProofModal(task)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    Confirm Delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-w-sm mx-auto text-center py-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">No active delivery task assigned</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Select an available pickup request below to begin your delivery route!
            </p>
          </div>
        )}
      </div>

      {/* Card 2: Available Delivery Pickup Requests */}
      <div className="space-y-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Bike className="w-5 h-5 text-amber-500" />
            <span>Available Delivery Pickup Requests ({availableForPickup.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pending requests looking for a volunteer courier to collect and deliver food.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 min-h-[200px] flex flex-col items-center justify-center text-center shadow-sm">
          {loading ? (
            <p className="text-slate-500 dark:text-slate-400 text-xs">Scanning available delivery dispatch requests...</p>
          ) : availableForPickup.length === 0 ? (
            <div className="space-y-2 max-w-sm py-4">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">No food available for pickup right now</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                All active delivery requests have been assigned. Check back shortly for new claims!
              </p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {availableForPickup.map((task) => (
                <div key={task.id || task._id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 hover:border-amber-500/40 transition shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{task.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Donor: {task.donorName}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Destination: {task.acceptedByNGO?.ngoName || task.requesterName || 'Delivery Destination'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{task.pickupAddress}</span>
                  </p>
                  <button
                    id={`accept_task_btn_${task.id || task._id}`}
                    data-testid="accept-task-btn"
                    onClick={() => openPickupProofModal(task)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Accept & Upload Pickup Proof</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pickup Proof Modal (Issue 1 Fix) */}
      {activeProofModal === 'pickup' && selectedTaskForProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-amber-500/40 rounded-2xl p-6 max-w-lg w-full space-y-4 text-slate-900 dark:text-white shadow-2xl relative">
            <button 
              onClick={() => setActiveProofModal(null)}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Camera className="w-4 h-4" />
                <span>STEP 1: UPLOAD PICKUP PROOF PHOTO</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Verify Food Collection at Donor Location
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Please upload or select a pickup verification photo of <strong>{selectedTaskForProof.title}</strong> before starting delivery.
              </p>
            </div>

            {/* Photo Selection Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Food Pickup Verification Photo:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {proofPhotoTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => { setProofPhotoUrl(tmpl.url); setCustomPhotoInput(''); }}
                    className={`h-20 rounded-lg overflow-hidden border cursor-pointer relative group transition ${
                      proofPhotoUrl === tmpl.url && !customPhotoInput ? 'border-amber-500 ring-2 ring-amber-500/40' : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={tmpl.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 p-1.5 flex items-end">
                      <span className="text-[10px] font-bold text-white leading-tight">{tmpl.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Or Enter Custom Image URL / Upload:
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                id="confirm_pickup_proof_btn"
                data-testid="confirm-pickup-proof-btn"
                onClick={handleConfirmPickupProof}
                disabled={submittingProof}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {submittingProof ? 'Saving Proof...' : 'Confirm Pickup Proof & Start Route'}
              </button>
              <button
                onClick={() => setActiveProofModal(null)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Proof Modal (Issue 9 Fix) */}
      {activeProofModal === 'delivery' && selectedTaskForProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-emerald-500/40 rounded-2xl p-6 max-w-lg w-full space-y-4 text-slate-900 dark:text-white shadow-2xl relative">
            <button 
              onClick={() => setActiveProofModal(null)}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Camera className="w-4 h-4" />
                <span>STEP 2: UPLOAD HANDOVER PROOF PHOTO</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Confirm Food Delivery & Handover
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Please upload or select a delivery confirmation photo for <strong>{selectedTaskForProof.title}</strong> before marking as completed.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Handover Verification Photo:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {proofPhotoTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => { setProofPhotoUrl(tmpl.url); setCustomPhotoInput(''); }}
                    className={`h-20 rounded-lg overflow-hidden border cursor-pointer relative group transition ${
                      proofPhotoUrl === tmpl.url && !customPhotoInput ? 'border-emerald-500 ring-2 ring-emerald-500/40' : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={tmpl.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 p-1.5 flex items-end">
                      <span className="text-[10px] font-bold text-white leading-tight">{tmpl.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Or Enter Custom Image URL / Upload:
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                id="confirm_handover_proof_btn"
                data-testid="confirm-handover-proof-btn"
                onClick={handleConfirmDeliveryProof}
                disabled={submittingProof}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {submittingProof ? 'Completing...' : 'Confirm Delivery & Handover Photo'}
              </button>
              <button
                onClick={() => setActiveProofModal(null)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking Map Modal */}
      <LiveTrackingModal
        isOpen={!!trackingTask}
        onClose={() => setTrackingTask(null)}
        donation={trackingTask}
      />
    </div>
  );
};

