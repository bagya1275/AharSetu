import React, { useState, useEffect } from 'react';
import { Donation, PlatformAnalytics } from '../types.js';
import { FoodCard } from '../components/FoodCard.js';
import { useAuth } from '../context/AuthContext.js';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Users, 
  Truck, 
  Building2, 
  Utensils, 
  Search, 
  Filter, 
  ChevronRight, 
  HelpCircle, 
  Award,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onSelectDonation: (donation: Donation) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectDonation }) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const handleDonorPortalClick = () => {
    if (!user) {
      sessionStorage.setItem('post_login_redirect', 'post-donation');
      onNavigate('auth');
    } else {
      onNavigate('post-donation');
    }
  };

  const handleNgoAccessClick = () => {
    if (!user) {
      sessionStorage.setItem('post_login_redirect', 'ngo-dashboard');
      onNavigate('auth');
    } else {
      onNavigate('ngo-dashboard');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donRes, anaRes] = await Promise.all([
          fetch('/api/donations'),
          fetch('/api/analytics')
        ]);
        if (donRes.ok) {
          const dData = await donRes.json();
          setDonations(dData.donations || []);
        }
        if (anaRes.ok) {
          const aData = await anaRes.json();
          setAnalytics(aData.analytics);
        }
      } catch (err) {
        console.error('Landing page load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered surplus food
  const filteredDonations = donations.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDietary = selectedDietary === 'all' || d.dietaryType === selectedDietary;
    return matchesSearch && matchesDietary;
  });

  return (
    <div className="space-y-16 pb-16 overflow-x-hidden bg-[#F9FBFA] dark:bg-slate-950 text-[#1A2E22] dark:text-slate-100 min-h-screen">
      
      {/* ================= HERO SECTION (SAAS SPLIT LAYOUT) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12">
          
          {/* Left Column - Hero Messaging & Action Split Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full lg:w-[55%] flex flex-col justify-center space-y-8 py-4"
          >
            
            {/* Active Pill Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="inline-flex items-center self-start px-3.5 py-1.5 bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 rounded-full shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] mr-2.5 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A] dark:text-green-400">
                100% NON-MONETARY FOOD REDISTRIBUTION NETWORK
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-[#111827] dark:text-white leading-[1.08] tracking-tight"
            >
              Connecting <span className="text-[#16A34A]">Surplus</span><br />
              To Every <span className="text-[#16A34A]">Soul.</span>
            </motion.h1>

            {/* Narrative text */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-base sm:text-lg text-[#4B5563] dark:text-slate-300 leading-relaxed max-w-[500px]"
            >
              AharSetu bridges banquet caterers, hotels, and restaurants directly with verified NGO shelters and volunteer riders to safely rescue meals before they go to waste.
            </motion.p>

            {/* Split Portal Action Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              
              {/* Donor Portal Card */}
              <motion.div 
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={handleDonorPortalClick}
                className="p-6 bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 rounded-2xl flex-1 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#16A34A] dark:text-green-400 uppercase tracking-widest">
                      Donor Portal
                    </span>
                    <Utensils className="w-4 h-4 text-[#16A34A] group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                    Post surplus food from catering events or kitchens in 60 seconds with expiry tracking.
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDonorPortalClick(); }}
                  className="w-full py-2.5 bg-[#1A2E22] hover:bg-[#13231a] text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  Donate Food
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>

              {/* NGO Access Card */}
              <motion.div 
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={handleNgoAccessClick}
                className="p-6 bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 rounded-2xl flex-1 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#16A34A] dark:text-green-400 uppercase tracking-widest">
                      NGO Access
                    </span>
                    <Building2 className="w-4 h-4 text-[#16A34A] group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                    View live nearby food offerings and request express volunteer pick-up for your shelter.
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNgoAccessClick(); }}
                  className="w-full py-2.5 border border-[#1A2E22] dark:border-slate-300 text-[#1A2E22] dark:text-slate-200 hover:bg-[#1A2E22] hover:text-white dark:hover:bg-slate-200 dark:hover:text-slate-900 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Claim Food
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>

            </motion.div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#4B5563] dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Verified Food Safety (FSSAI)</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#16A34A]" />
                <span>Real-Time Express Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#16A34A]" />
                <span>Zero Charge Policy</span>
              </div>
            </div>

          </motion.div>

          {/* Right Column - Live Split Dashboard Display */}
          <div className="w-full lg:w-[45%] bg-[#F3F7F4] dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl flex flex-col justify-between border border-[#E8EEEA] dark:border-slate-800 shadow-sm">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-green-900/5 p-6 sm:p-8 border border-white dark:border-slate-800 space-y-6 flex-1 flex flex-col justify-between">
              
              {/* Dashboard Header */}
              <div className="flex justify-between items-center border-b border-[#E8EEEA] dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#16A34A] dark:text-green-400 uppercase tracking-widest">
                    Network Pulse
                  </span>
                  <h3 className="text-lg font-bold text-[#111827] dark:text-white">
                    Live Impact Monitor
                  </h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/50 text-[11px] font-bold text-[#16A34A]">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                  Live Sync
                </div>
              </div>

              {/* Stats Grid inside Right Column */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9FBFA] dark:bg-slate-800/80 p-4 rounded-2xl border border-[#E8EEEA] dark:border-slate-700/80 space-y-1">
                  <span className="text-2xl font-bold text-[#111827] dark:text-white block">
                    {analytics ? analytics.totalMealsServed.toLocaleString() : '125,400'}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                    Meals Rescued
                  </span>
                </div>

                <div className="bg-[#F9FBFA] dark:bg-slate-800/80 p-4 rounded-2xl border border-[#E8EEEA] dark:border-slate-700/80 space-y-1">
                  <span className="text-2xl font-bold text-[#16A34A] block">
                    {analytics ? analytics.totalActiveDonors : '145+'}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                    Active Donors
                  </span>
                </div>

                <div className="bg-[#F9FBFA] dark:bg-slate-800/80 p-4 rounded-2xl border border-[#E8EEEA] dark:border-slate-700/80 space-y-1">
                  <span className="text-2xl font-bold text-[#111827] dark:text-white block">
                    {analytics ? analytics.totalNgosVerified : '85'}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                    NGO Partners
                  </span>
                </div>

                <div className="bg-[#F9FBFA] dark:bg-slate-800/80 p-4 rounded-2xl border border-[#E8EEEA] dark:border-slate-700/80 space-y-1">
                  <span className="text-2xl font-bold text-[#16A34A] block">
                    {analytics ? `${(analytics.co2SavedKg / 1000).toFixed(1)}t` : '2.4t'}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                    CO₂ Saved
                  </span>
                </div>
              </div>

              {/* Catchy AharSetu Photo Feature Card */}
              <div className="relative rounded-2xl overflow-hidden h-36 border border-emerald-200 dark:border-slate-700 shadow-sm group">
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800" 
                  alt="AharSetu Community Food Redistribution" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3.5 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
                    <Sparkles className="w-3 h-3" />
                    Zero Waste Community Impact
                  </div>
                  <p className="text-xs font-bold text-white leading-snug">
                    Over 125,000 fresh banquet meals redirected to children's shelters this month.
                  </p>
                </div>
              </div>

              {/* Quick Platform Security Badge */}
              <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span className="text-xs font-bold text-[#111827] dark:text-white">Verified Food Quality Standard</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                  All posts undergo temperature, aroma, and preparation timestamp validation before shelter dispatch.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ================= IMPACT STATS BAR ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          
          <div className="space-y-1">
            <span className="font-serif-display text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {analytics ? analytics.totalMealsServed.toLocaleString() : '125,400+'}
            </span>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Meals Saved & Served
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-serif-display text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {analytics ? analytics.totalActiveDonors : '145+'}
            </span>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Verified Donors
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-serif-display text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {analytics ? analytics.totalNgosVerified : '85+'}
            </span>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              NGO Shelter Partners
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-serif-display text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {analytics ? `${(analytics.co2SavedKg / 1000).toFixed(1)} Tons` : '2.4 Tons'}
            </span>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              CO₂ Emissions Prevented
            </span>
          </div>

        </div>
      </section>

      {/* ================= SURPLUS FOOD LIVE FEED ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              Live Food Redistribution Feed
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Active Surplus Food Posts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Fresh surplus meals available right now for nearby shelter pick-up.
            </p>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search area, title, donor..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedDietary}
              onChange={e => setSelectedDietary(e.target.value)}
              className="py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Dietary Types</option>
              <option value="veg">Pure Veg</option>
              <option value="non_veg">Non-Veg</option>
              <option value="vegan">Vegan</option>
              <option value="jain">Jain Compliant</option>
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredDonations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Utensils className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No surplus food matching filters</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or post a new donation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.slice(0, 6).map(donation => (
              <FoodCard
                key={donation.id}
                donation={donation}
                onSelect={onSelectDonation}
                onClaim={handleNgoAccessClick}
              />
            ))}
          </div>
        )}

      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-[#1A2E22] text-white py-16 rounded-3xl max-w-7xl mx-auto px-6 lg:px-12 relative overflow-hidden shadow-xl border border-[#E8EEEA] dark:border-slate-800">
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="text-xs font-bold text-[#16A34A] uppercase tracking-widest">Simple & Transparent</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How AharSetu Works in 4 Steps</h2>
          <p className="text-sm text-green-100/80">From banquet hall overflow to a warm nutritious meal in minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
            <span className="text-2xl font-black text-[#16A34A]">01</span>
            <h3 className="font-bold text-base text-white">Donor Posts Food</h3>
            <p className="text-xs text-green-100/80 leading-relaxed">
              Restaurants or caterers log surplus food details with quantity, expiry time, and location photos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
            <span className="text-2xl font-black text-[#16A34A]">02</span>
            <h3 className="font-bold text-base text-white">NGO Claims Portion</h3>
            <p className="text-xs text-green-100/80 leading-relaxed">
              Nearby verified NGOs receive push alerts and accept donations matching their shelter capacity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
            <span className="text-2xl font-black text-[#16A34A]">03</span>
            <h3 className="font-bold text-base text-white">Volunteer Dispatched</h3>
            <p className="text-xs text-green-100/80 leading-relaxed">
              Riders navigate to the donor location with thermal food bags for express pickup.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
            <span className="text-2xl font-black text-[#16A34A]">04</span>
            <h3 className="font-bold text-base text-white">Delivered & Verified</h3>
            <p className="text-xs text-green-100/80 leading-relaxed">
              Food is distributed to children/shelter residents and an 80G PDF receipt is auto-generated for the donor.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#16A34A] uppercase tracking-widest">Got Questions?</span>
          <h2 className="text-3xl font-bold text-[#111827] dark:text-slate-100">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 space-y-2 shadow-xs">
            <h3 className="font-bold text-base text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#16A34A] shrink-0" />
              Is there any payment or commission involved?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
              No. AharSetu is a 100% donation-based non-monetary platform. No payment, delivery charge, or transaction fee is ever collected from donors, NGOs, or recipients.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 space-y-2 shadow-xs">
            <h3 className="font-bold text-base text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#16A34A] shrink-0" />
              How is food safety and hygiene guaranteed?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
              Donors must provide cooking timestamps and storage thermal details. Volunteers inspect aroma, temperature, and visual condition prior to pickup.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 space-y-2 shadow-xs">
            <h3 className="font-bold text-base text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#16A34A] shrink-0" />
              How do donors receive tax receipts or impact certificates?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
              Once an NGO confirms delivery, donors can instantly download an official AharSetu PDF Receipt detailing total meal count, weight, and CO2 emissions saved.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-12 rounded-3xl bg-[#1A2E22] text-white text-center space-y-6 shadow-xl relative overflow-hidden border border-[#E8EEEA] dark:border-slate-800">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Turn Surplus Food into Smiles?</h2>
            <p className="text-sm text-emerald-100/90">
              Join hundreds of hotel caterers, restaurants, and volunteers making a real impact today.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <button
                onClick={handleDonorPortalClick}
                className="py-3.5 px-8 rounded-full bg-[#16A34A] text-white font-extrabold text-sm hover:bg-[#15803D] transition-all shadow-lg shadow-green-900/50"
              >
                Donate Food Now
              </button>
              <button
                onClick={() => onNavigate('leaderboard')}
                className="py-3.5 px-8 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
