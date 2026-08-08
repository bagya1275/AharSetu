import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { 
  Sparkles, 
  MapPin, 
  Utensils, 
  Clock, 
  Upload, 
  Save, 
  CheckCircle2, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface DonationFormPageProps {
  onNavigate: (page: string) => void;
}

export const DonationFormPage: React.FC<DonationFormPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [foodType, setFoodType] = useState('cooked_meal');
  const [dietaryType, setDietaryType] = useState('veg');
  const [quantityServings, setQuantityServings] = useState<number>(40);
  const [quantityWeightKg, setQuantityWeightKg] = useState<number>(14);
  const [expiryHours, setExpiryHours] = useState<number>(6);
  const [address, setAddress] = useState(user?.address || 'Main City Area');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!title.trim() || !quantityServings) {
      showToast('Required Fields Missing', 'Please enter a title and serving quantity.', 'alert');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aharseu_token')}`
        },
        body: JSON.stringify({
          title,
          description,
          foodType,
          dietaryType,
          quantityServings,
          quantityWeightKg,
          expiryHours,
          address,
          images: [imageUrl],
          isDraft
        })
      });

      if (res.ok) {
        showToast(
          isDraft ? 'Draft Saved' : 'Donation Post Live!',
          isDraft ? 'You can complete this post anytime from your dashboard.' : 'Nearby NGOs have been notified for pickup.',
          'success'
        );
        onNavigate('donor-dashboard');
      }
    } catch (err) {
      console.error('Failed to submit donation', err);
      showToast('Submission Error', 'Failed to save donation. Please try again.', 'alert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('donor-dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
        <div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
            Donation Dispatch
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Post Surplus Food Donation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            List fresh extra food from banquets, restaurants, or home events for instant NGO rescue.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Donation Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Surplus Banquet Buffet - Paneer Masala & Naan"
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Food Description & Packaging Info
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Cooked 2 hours ago for corporate lunch. Stored in clean hot thermal vessels. Includes 40 portions of Dal Makhani and Jeera Rice."
              rows={3}
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Grid: Food Type & Dietary Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Food Category
              </label>
              <select
                value={foodType}
                onChange={e => setFoodType(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="cooked_meal">Cooked Hot Meals</option>
                <option value="packaged_food">Packaged Meal Boxes</option>
                <option value="baked_goods">Baked Goods & Breads</option>
                <option value="raw_ingredients">Raw Grains / Ingredients</option>
                <option value="fruits_veggies">Fresh Fruits & Veggies</option>
                <option value="beverages">Beverages / Milk Drinks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Dietary Specification
              </label>
              <select
                value={dietaryType}
                onChange={e => setDietaryType(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="veg">🟢 Pure Vegetarian</option>
                <option value="non_veg">🔴 Non-Vegetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="jain">⚪ Jain Compliant</option>
              </select>
            </div>
          </div>

          {/* Grid: Servings, Weight, Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Servings (Adult Meals) *
              </label>
              <input
                type="number"
                value={quantityServings}
                onChange={e => setQuantityServings(Number(e.target.value))}
                min={1}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated Net Weight (kg)
              </label>
              <input
                type="number"
                value={quantityWeightKg}
                onChange={e => setQuantityWeightKg(Number(e.target.value))}
                min={1}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Safe Expiry (Hours)
              </label>
              <input
                type="number"
                value={expiryHours}
                onChange={e => setExpiryHours(Number(e.target.value))}
                min={1}
                max={48}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Location Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#111827] dark:text-slate-300">
              Pickup Address & Landmark Details
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter exact landmark or building address..."
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#F9FBFA] dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 text-xs font-medium text-[#111827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
            </div>
            <p className="text-[11px] text-gray-400">
              Assigned volunteer riders will navigate directly to this pickup address.
            </p>
          </div>

          {/* Image Thumbnail Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Preloaded Food Inspection Photo (6 Templates)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600', label: 'Buffet / Thali' },
                { url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600', label: 'Biryani & Rice' },
                { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600', label: 'Salads & Veggies' },
                { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600', label: 'Breads & Bakery' },
                { url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600', label: 'Fruit Baskets' },
                { url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&q=80&w=600', label: 'Sweets & Desserts' }
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => setImageUrl(item.url)}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer h-28 border-2 transition-all group ${
                    imageUrl === item.url
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={item.url} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-center">
                    <span className="text-[10px] font-bold text-white drop-shadow-sm">{item.label}</span>
                  </div>
                  {imageUrl === item.url && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Submit Donation Post
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
};
