import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Donation, InspectionTemplate } from '../types/index.ts';
import { X, Send, Bookmark, Image as ImageIcon, Utensils, CheckCircle2 } from 'lucide-react';

interface PostDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonationCreated: (donation: Donation) => void;
}

export const inspectionTemplates: InspectionTemplate[] = [
  {
    id: 'template_1',
    label: 'Buffet / Thali',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'template_2',
    label: 'Biryani & Rice',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'template_3',
    label: 'Salads & Veggies',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'template_4',
    label: 'Breads & Bakery',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'template_5',
    label: 'Fruit Baskets',
    url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'template_6',
    label: 'Sweets & Desserts',
    url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80'
  }
];

export const PostDonationModal: React.FC<PostDonationModalProps> = ({ isOpen, onClose, onDonationCreated }) => {
  const [title, setTitle] = useState('Surplus Banquet Buffet - Paneer Masala & Naan');
  const [description, setDescription] = useState('Cooked 2 hours ago for corporate lunch. Stored in clean hot thermal vessels. Includes 40 portions of Dal Makhani and Jeera Rice.');
  const [category, setCategory] = useState('Cooked Hot Meals');
  const [dietary, setDietary] = useState('Pure Vegetarian');
  const [servings, setServings] = useState(40);
  const [weightKg, setWeightKg] = useState(14);
  const [expiryHours, setExpiryHours] = useState(6);
  const [pickupAddress, setPickupAddress] = useState('Delhi NCR, India');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(inspectionTemplates[0].url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!title || !description || !pickupAddress || !servings) {
        setError('Please fill in all required fields marked with *');
        setLoading(false);
        return;
      }

      const res = await api.createDonation({
        title,
        description,
        category,
        dietary,
        servings: Number(servings),
        weightKg: Number(weightKg),
        expiryHours: Number(expiryHours),
        pickupAddress,
        photoUrl: selectedTemplate
      });

      if (!res.success) {
        setError(res.message || 'Failed to post donation');
        setLoading(false);
        return;
      }

      onDonationCreated(res.donation);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div 
        id="post_donation_modal_container"
        data-testid="post-donation-modal"
        className="relative w-full max-w-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-900 dark:text-white my-8 max-h-[90vh] overflow-y-auto"
      >
        <button
          id="close_post_modal_btn"
          data-testid="close-post-modal"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            DONATION DISPATCH
          </p>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Post Surplus Food Donation
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            List fresh extra food from banquets, restaurants, or home events for instant NGO rescue.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Donation Title *
            </label>
            <input
              id="input_donation_title"
              data-testid="input-donation-title"
              key="input_donation_title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Surplus Banquet Buffet - Paneer Masala & Naan"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Food Description & Packaging Info
            </label>
            <textarea
              id="input_donation_desc"
              data-testid="input-donation-desc"
              key="input_donation_desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Cooked 2 hours ago for corporate lunch. Stored in clean hot thermal vessels..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Food Category
              </label>
              <select
                id="select_category"
                data-testid="select-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
              >
                <option value="Cooked Hot Meals">Cooked Hot Meals</option>
                <option value="Bakery & Breads">Bakery & Breads</option>
                <option value="Packaged Groceries">Packaged Groceries</option>
                <option value="Fresh Produce & Fruits">Fresh Produce & Fruits</option>
                <option value="Sweets & Desserts">Sweets & Desserts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dietary Specification
              </label>
              <select
                id="select_dietary"
                data-testid="select-dietary"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
              >
                <option value="Pure Vegetarian">🟢 Pure Vegetarian</option>
                <option value="Non-Vegetarian">🔴 Non-Vegetarian</option>
                <option value="Vegan / Jain Option">🌱 Vegan / Jain Option</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Servings (Adult Meals) *
              </label>
              <input
                id="input_servings"
                data-testid="input-servings"
                key="input_servings"
                type="number"
                required
                min={1}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Net Weight (kg)
              </label>
              <input
                id="input_weight"
                data-testid="input-weight"
                key="input_weight"
                type="number"
                min={1}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Safe Expiry (Hours)
              </label>
              <input
                id="input_expiry"
                data-testid="input-expiry"
                key="input_expiry"
                type="number"
                min={1}
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pickup Address & Landmark Details
            </label>
            <input
              id="input_pickup_address"
              data-testid="input-pickup-address"
              key="input_pickup_address"
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. Delhi NCR, India"
              className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
            />
            <p className="text-[10px] text-slate-500 mt-1">Assigned volunteer riders will navigate directly to this pickup address.</p>
          </div>

          {/* Preloaded Food Inspection Photo Templates */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Preloaded Food Inspection Photo (6 Templates)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {inspectionTemplates.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.url;
                return (
                  <div
                    key={tmpl.id}
                    id={tmpl.id}
                    data-testid={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.url)}
                    className={`relative h-20 rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                      isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/40' : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={tmpl.url} alt={tmpl.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                      <span className="text-[10px] font-bold text-white drop-shadow">{tmpl.label}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-slate-800">
            <button
              id="submit_donation_btn"
              data-testid="submit-donation-btn"
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Donation Post'}</span>
            </button>
            <button
              id="save_draft_btn"
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs transition border border-slate-700 flex items-center space-x-1.5"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
