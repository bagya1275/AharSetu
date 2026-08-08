import React from 'react';
import { Donation } from '../types/index.ts';
import { X, Bike, MapPin, CheckCircle2, Clock, ShieldCheck, Navigation, Phone, Check, Image as ImageIcon } from 'lucide-react';

interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({ isOpen, onClose, donation }) => {
  if (!isOpen || !donation) return null;

  const isAccepted = donation.status === 'ACCEPTED';
  const isInTransit = donation.status === 'IN_TRANSIT';
  const isDelivered = donation.status === 'DELIVERED';

  // Issue 3 fix: Dynamic Status Badge
  const getStatusBadge = () => {
    if (isDelivered) {
      return {
        text: 'Food Delivered / Completed',
        className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      };
    }
    if (isInTransit) {
      return {
        text: 'In Transit / Picked Up',
        className: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      };
    }
    return {
      text: 'Will be picked up by a volunteer',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    };
  };

  const badge = getStatusBadge();

  // Issue 10 fix: Dynamic Destination Label
  const destinationName = donation.acceptedByNGO?.ngoName || donation.requesterName || 'Delivery Destination';
  const destinationAddr = donation.destinationAddress || donation.acceptedByNGO?.ngoName || 'Recipient Location';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div 
        id="live_tracking_modal_container"
        data-testid="live-tracking-modal"
        className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-900 dark:text-white my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="close_live_tracking_modal_btn"
          data-testid="close-live-tracking-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Title and Dynamic Status Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                LIVE GPS ROUTE MAP
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">ID: {donation.id || donation._id}</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {donation.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {donation.servings} Servings ({donation.weightKg} kg) • {donation.category}
            </p>
          </div>

          {/* Issue 3: Dynamic Status Badge */}
          <div className="flex items-center">
            <span 
              id="live_tracking_status_badge"
              data-testid="live-tracking-status-badge"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${badge.className} flex items-center space-x-2`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              <span>{badge.text}</span>
            </span>
          </div>
        </div>

        {/* Live GPS Animated Map Card */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden mb-6">
          {/* Simulated Map Visual */}
          <div className="relative h-52 w-full rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Route Line */}
            <div className="absolute top-1/2 left-12 right-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0">
              <div 
                className={`h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-blue-500 rounded-full transition-all duration-700 ${
                  isDelivered ? 'w-full' : isInTransit ? 'w-2/3' : 'w-1/3'
                }`}
              ></div>
            </div>

            {/* Pickup Node */}
            <div className="relative z-10 flex justify-between items-center h-full px-4">
              <div className="flex flex-col items-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/30 shadow-sm">
                  Pickup: {donation.donorName}
                </span>
                <span className="text-[9px] text-slate-600 dark:text-slate-400 max-w-[120px] text-center truncate">{donation.pickupAddress}</span>
              </div>

              {/* Courier Rider Icon */}
              <div className="flex flex-col items-center space-y-1">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-xl transition-all duration-500 ${
                  isDelivered 
                    ? 'bg-emerald-500 border-emerald-300 text-slate-950 scale-105' 
                    : isInTransit 
                    ? 'bg-amber-500 border-amber-300 text-slate-950 animate-bounce' 
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <Bike className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30 shadow-sm">
                  {donation.assignedVolunteer ? donation.assignedVolunteer.volunteerName : 'Express Volunteer Rider'}
                </span>
              </div>

              {/* Issue 10: Dynamic Destination Node */}
              <div className="flex flex-col items-center space-y-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  isDelivered ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-blue-600 text-white'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-blue-500/30 shadow-sm">
                  {destinationName}
                </span>
                <span className="text-[9px] text-slate-600 dark:text-slate-400 max-w-[120px] text-center truncate">{destinationAddr}</span>
              </div>
            </div>

            {/* Issue 8 Fix: Live Status Label inside Map */}
            <div className="relative z-10 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2 rounded-xl flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {isDelivered 
                    ? 'Delivery Completed & Handover Verified' 
                    : isInTransit 
                    ? 'Rider En Route to Destination (GPS Active)' 
                    : 'Volunteer Assigned • En Route to Donor Pickup'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {isDelivered ? 'COMPLETED' : 'ESTIMATED ETA: 12 MINS'}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Progress Stages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center space-y-1 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto text-xs font-bold">1</div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Request Claimed</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Order logged in system</p>
          </div>

          <div className={`border p-3 rounded-xl text-center space-y-1 shadow-sm ${
            isInTransit || isDelivered ? 'bg-slate-50 dark:bg-slate-900 border-emerald-500/50' : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
              isInTransit || isDelivered ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>2</div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Food Picked Up</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Volunteer at donor location</p>
          </div>

          <div className={`border p-3 rounded-xl text-center space-y-1 shadow-sm ${
            isInTransit ? 'bg-amber-500/10 border-amber-500' : isDelivered ? 'bg-slate-50 dark:bg-slate-900 border-emerald-500/50' : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
              isDelivered ? 'bg-emerald-500 text-slate-950' : isInTransit ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>3</div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">In Transit</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Rider on the road</p>
          </div>

          <div className={`border p-3 rounded-xl text-center space-y-1 shadow-sm ${
            isDelivered ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
              isDelivered ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>4</div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Delivered</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Handover proof verified</p>
          </div>
        </div>

        {/* Verification Photos Section (Pickup Proof & Handover Proof) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ImageIcon className="w-4 h-4" />
              <span>Pickup Verification Proof</span>
            </div>
            {donation.pickupProofUrl ? (
              <img src={donation.pickupProofUrl} alt="Pickup Proof" className="w-full h-36 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="h-36 bg-white dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                <Clock className="w-5 h-5 mb-1" />
                <span>Pending volunteer pickup photo upload</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <ImageIcon className="w-4 h-4" />
              <span>Delivery Handover Proof</span>
            </div>
            {donation.deliveryProofUrl ? (
              <img src={donation.deliveryProofUrl} alt="Delivery Proof" className="w-full h-36 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="h-36 bg-white dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                <Clock className="w-5 h-5 mb-1" />
                <span>Pending delivery handover photo upload</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
