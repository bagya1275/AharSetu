import React, { useEffect } from 'react';
import { Donation } from '../types.js';
import { jsPDF } from 'jspdf';
import { X, Download, FileCheck2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PdfReceiptModalProps {
  donation: Donation | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const PdfReceiptModal: React.FC<PdfReceiptModalProps> = ({ donation, isOpen = true, onClose }) => {
  const [downloaded, setDownloaded] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const showModal = Boolean(donation && isOpen);

  const handleDownload = () => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(16, 185, 129); // Emerald 500
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('AharSetu', 15, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL SURPLUS FOOD REDISTRIBUTION RECEIPT', 15, 28);
      doc.text('Zero-Waste Verification', 140, 20);

      // Certificate Body
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Receipt ID: ${donation.id.toUpperCase()}`, 15, 50);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date of Delivery: ${new Date(donation.deliveryTimestamp || donation.updatedAt).toLocaleDateString()}`, 15, 57);

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 63, 195, 63);

      // Section 1: Donor & NGO Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('DONOR DETAILS', 15, 75);
      doc.text('RECIPIENT NGO', 110, 75);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${donation.donorOrg || donation.donorName}`, 15, 83);
      doc.text(`Contact: ${donation.donorPhone}`, 15, 90);
      doc.text(`Pickup Address: ${donation.address}`, 15, 97, { maxWidth: 85 });

      doc.text(`NGO Name: ${donation.ngoName || 'Annam Seva Foundation'}`, 110, 83);
      doc.text(`Volunteer Carrier: ${donation.volunteerName || 'Rahul Verma'}`, 110, 90);
      doc.text(`Status: Verified Handover Complete`, 110, 97);

      // Table Box
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 115, 180, 50, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(15, 115, 180, 50, 'S');

      doc.setFont('helvetica', 'bold');
      doc.text('FOOD CONTRIBUTION SUMMARY', 20, 125);

      doc.setFont('helvetica', 'normal');
      doc.text(`Title: ${donation.title}`, 20, 135);
      doc.text(`Servings Provided: ${donation.quantityServings} Meals`, 20, 143);
      doc.text(`Estimated Net Weight: ${donation.quantityWeightKg || Math.round(donation.quantityServings * 0.35)} kg`, 20, 151);
      doc.text(`Environmental Impact: ~${Math.round((donation.quantityWeightKg || 15) * 2.5)} kg CO2 Emissions Prevented`, 20, 159);

      // Legal & Verification Note
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Note: This donation was purely non-monetary and carried out under AharSetu Food Safety Guidelines.', 15, 180);
      doc.text('Section 80G Tax Exemption Eligibility: Applies under Charitable Surplus Food Rescue Standard.', 15, 186);

      // Signatures
      doc.setDrawColor(16, 185, 129);
      doc.line(15, 220, 80, 220);
      doc.text('Authorized AharSetu Signatory', 15, 226);

      doc.line(130, 220, 195, 220);
      doc.text('NGO Recipient Seal & Stamp', 130, 226);

      doc.save(`AharSetu_Receipt_${donation.id}.pdf`);
      setDownloaded(true);
    } catch (err) {
      console.error('PDF generation error', err);
    }
  };

  return (
    <AnimatePresence>
      {showModal && donation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Donation Receipt</h3>
              <p className="text-xs text-slate-500">Official Non-Monetary Proof of Impact</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Card Preview */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/50 border border-emerald-200 dark:border-emerald-900/50 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">AharSetu Certified</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{donation.title}</h4>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">
              {donation.quantityServings} Meals
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-900/10 dark:border-slate-700">
            <div>
              <span className="text-slate-500 block">Donor Organization</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{donation.donorOrg || donation.donorName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Recipient NGO</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{donation.ngoName || 'Annam Seva Foundation'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Delivery Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(donation.deliveryTimestamp || donation.updatedAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">CO2 Offset</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">~{Math.round((donation.quantityWeightKg || 15) * 2.5)} kg</span>
            </div>
          </div>
        </div>

        {downloaded && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Receipt PDF downloaded successfully!
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {downloaded ? 'Download PDF Again' : 'Download PDF Receipt'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
