import React from 'react';
import { Donation, User } from '../types/index.ts';
import { X, Download, ShieldCheck, Printer, CheckCircle2, Award } from 'lucide-react';

interface DonationReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
  user?: User | null;
}

export const DonationReceiptModal: React.FC<DonationReceiptModalProps> = ({ isOpen, onClose, donation, user }) => {
  if (!isOpen || !donation) return null;

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        id="donation_receipt_modal_container"
        data-testid="donation-receipt-modal"
        className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-900 dark:text-white my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button ('X' icon - Issue 1 Fix) */}
        <button
          id="close_receipt_modal_x_btn"
          data-testid="close-receipt-modal-x"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-3">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            OFFICIAL SECTION 80G TAX IMPACT RECEIPT
          </p>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
            AharSetu Food Redistribution Certificate
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Receipt Ref: <span className="text-emerald-600 dark:text-emerald-300 font-mono">REC-80G-{(donation.id || donation._id || '1029').toUpperCase()}</span>
          </p>
        </div>

        {/* Certificate Details Body */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-500 text-[10px] uppercase font-bold">Donor Partner</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{donation.donorName}</p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">{user?.email || 'verified_partner@aharsetu.org'}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 dark:text-slate-500 text-[10px] uppercase font-bold">Recipient Organization</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {donation.acceptedByNGO?.ngoName || donation.requesterName || 'AharSetu Community Shelter'}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">80G Exemption Reg: AAATA1234F</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400">Food Item Title:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{donation.title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400">Category & Dietary:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{donation.category} ({donation.dietary})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400">Total Servings Rescued:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{donation.servings} Meals</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400">Net Food Weight:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{donation.weightKg} kg</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400">Carbon Footprint Saved:</span>
              <span className="font-semibold text-teal-600 dark:text-teal-300">~{Math.round(donation.weightKg * 2.5)} kg CO2e</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Dispatch Address:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{donation.pickupAddress}</span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>This certificate verifies that surplus food was collected, inspected, and delivered in compliance with FSSAI hygiene guidelines.</span>
          </div>
        </div>

        {/* Action Buttons (Download + Close Button - Issue 1 Fix) */}
        <div className="flex items-center space-x-3">
          <button
            id="download_receipt_pdf_btn"
            data-testid="download-receipt-pdf-btn"
            onClick={handleDownloadPdf}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Receipt</span>
          </button>
          
          <button
            id="close_receipt_modal_bottom_btn"
            data-testid="close-receipt-modal-bottom"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-5 rounded-xl text-xs transition border border-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
