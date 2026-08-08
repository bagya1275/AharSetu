import React from 'react';
import { Donation } from '../types.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { PdfReceiptModal } from '../components/PdfReceiptModal.js';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Truck, 
  Building2, 
  FileText, 
  ArrowLeft,
  ShieldCheck,
  User
} from 'lucide-react';

interface DeliveryTrackingPageProps {
  donation: Donation | null;
  onNavigate: (page: string) => void;
}

export const DeliveryTrackingPage: React.FC<DeliveryTrackingPageProps> = ({ donation, onNavigate }) => {
  const [showReceipt, setShowReceipt] = React.useState(false);

  if (!donation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Clock className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Donation post not found</h2>
        <button
          onClick={() => onNavigate('home')}
          className="py-2.5 px-5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Surplus Food Posted', done: true, time: new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { key: 'accepted', label: 'NGO Claimed Portion', done: donation.status !== 'pending' && donation.status !== 'draft', time: donation.ngoName ? 'Claimed' : 'Pending' },
    { key: 'assigned', label: 'Volunteer Dispatched', done: donation.status === 'assigned' || donation.status === 'picked_up' || donation.status === 'delivered', time: donation.volunteerName ? 'Assigned' : 'Awaiting' },
    { key: 'picked_up', label: 'In Transit', done: donation.status === 'picked_up' || donation.status === 'delivered', time: donation.pickupTimestamp ? 'Picked Up' : 'On Way' },
    { key: 'delivered', label: 'Delivered to Destination', done: donation.status === 'delivered', time: donation.deliveryTimestamp ? 'Completed' : 'Pending' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Top Navigation */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Main Status Container */}
      <div className="bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Live Mission Tracker
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {donation.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Ref ID: <span className="font-mono text-slate-700 dark:text-slate-300">{donation.id}</span> • {donation.quantityServings} Meals ({donation.quantityWeightKg || Math.round(donation.quantityServings * 0.35)} kg)
            </p>
          </div>

          <StatusBadge 
            status={donation.status} 
            pickupMethod={donation.pickupMethod}
            volunteerId={donation.volunteerId}
            volunteerName={donation.volunteerName}
            size="lg" 
          />
        </div>

        {/* Stepper Timeline */}
        <div className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex sm:flex-col items-center sm:text-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${step.done ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {step.done ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${step.done ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                    {step.label}
                  </h4>
                  <span className="text-[10px] text-slate-400">{step.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteer Courier & Live GPS Tracking Card */}
        {donation.pickupMethod === 'volunteer' && (
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg overflow-hidden relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Express Volunteer Delivery
                </h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {(!donation.volunteerName && !donation.volunteerId) 
                  ? '⏳ Waiting for volunteer acceptance'
                  : donation.status === 'delivered'
                  ? '✅ Food Delivered'
                  : donation.status === 'picked_up'
                  ? '🚚 In Transit (Picked Up)'
                  : '🚚 Will be picked up by a volunteer'}
              </span>
            </div>

            {(!donation.volunteerName && !donation.volunteerId) ? (
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Waiting for a volunteer to accept this pickup request...</span>
                </div>
                <p className="text-slate-400">
                  This delivery request is live on the AharSetu Volunteer Network. A nearby express rider will accept it shortly to collect food from <strong className="text-white">{donation.donorName}</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Rider</span>
                    <span className="font-extrabold text-white text-sm flex items-center gap-1.5 mt-0.5">
                      <User className="w-4 h-4 text-emerald-400" />
                      {donation.volunteerName || 'AharSetu Express Rider'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Rider Contact</span>
                    <span className="font-semibold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      {donation.volunteerPhone || '+91 98765 43210'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle Logistics</span>
                    <span className="font-semibold text-slate-200 block mt-0.5">
                      Electric Thermal Express Van
                    </span>
                  </div>
                </div>

                {/* Simulated Live Route Map Graphic */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${donation.status === 'delivered' ? 'bg-emerald-400' : 'bg-emerald-500 animate-ping'}`} />
                      {donation.status === 'delivered' ? 'GPS MISSION LOG (COMPLETED)' : 'LIVE GPS MAP TRACKING'}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {donation.status === 'delivered' ? '✅ Food Delivered Successfully' : 'Route Active • ETA 15 Mins'}
                    </span>
                  </div>

                  <div className="relative h-24 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center px-6 justify-between">
                    {/* Route line */}
                    <div className="absolute left-10 right-10 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

                    {/* Donor Marker */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-slate-900">
                        A
                      </div>
                      <span className="text-[10px] text-emerald-300 font-bold mt-1 max-w-[80px] text-center truncate">Pickup</span>
                    </div>

                    {/* Moving / Completed Rider Marker */}
                    {donation.status === 'delivered' ? (
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white">
                          <CheckCircle2 className="w-5 h-5 text-slate-950" />
                        </div>
                        <span className="text-[10px] text-emerald-300 font-bold mt-1">Delivery Completed</span>
                      </div>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center animate-bounce">
                        <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white">
                          <Truck className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] text-amber-300 font-bold mt-1">
                          {donation.status === 'picked_up' ? 'Rider In Transit' : 'Rider Dispatched'}
                        </span>
                      </div>
                    )}

                    {/* Destination Marker */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full ${donation.status === 'delivered' ? 'bg-emerald-600' : 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-slate-900`}>
                        B
                      </div>
                      <span className="text-[10px] text-blue-300 font-bold mt-1 max-w-[100px] text-center truncate">
                        {donation.ngoName || 'Destination'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Route Details Card */}
        <div className="p-5 rounded-2xl bg-[#F9FBFA] dark:bg-slate-800/80 border border-[#E8EEEA] dark:border-slate-700 space-y-4">
          <h3 className="text-xs font-bold text-[#16A34A] uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#16A34A]" />
            Location & Dispatch Routing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Pickup Location</span>
              <p className="font-bold text-[#111827] dark:text-white">{donation.donorName} ({donation.donorOrg || 'Food Outlet'})</p>
              <p className="text-gray-500 dark:text-slate-400">{donation.address}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Delivery Destination</span>
              <p className="font-bold text-[#111827] dark:text-white">{donation.ngoName || 'Verified Recipient / Beneficiary'}</p>
              <p className="text-gray-500 dark:text-slate-400">{donation.ngoPhone ? `Contact: ${donation.ngoPhone}` : 'Verified Recipient Destination'}</p>
            </div>
          </div>
        </div>

        {/* Proof Images if Delivered */}
        {donation.status === 'delivered' && (
          <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/60 border border-emerald-200 dark:border-emerald-900/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Delivery Confirmation Proof
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {donation.pickupProof && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">Pickup Verification Photo</span>
                  <img src={donation.pickupProof} alt="Pickup Proof" className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Delivery Handover Photo</span>
                <img 
                  src={donation.deliveryProof || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400'} 
                  alt="Delivery Proof" 
                  className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-slate-700" 
                />
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(true)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download Official Impact PDF Receipt
            </button>
          </div>
        )}

      </div>

      <PdfReceiptModal
        donation={donation}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />

    </div>
  );
};
