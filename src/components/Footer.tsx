import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-[#05080f] border-t border-slate-200 dark:border-slate-900 text-slate-600 dark:text-slate-400 text-xs py-12 px-4 md:px-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-lg">
              A
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-slate-900 dark:text-white tracking-tight">AharSetu</span>
              <p className="text-[9px] tracking-widest text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Smart Redistribution</p>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            India's premier 100% donation-based smart food rescue network connecting hotel caterers, restaurants, and individuals with verified NGOs and shelters.
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Non-Monetary Ecosystem</span>
          </div>
        </div>

        {/* Col 2: Quick Navigation */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li><a href="#mission" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Home Landing Page</a></li>
            <li><a href="#mission" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Mission & Vision</a></li>
            <li><a href="#leaderboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Community Leaderboard</a></li>
            <li><a href="#post" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Post Food Donation</a></li>
          </ul>
        </div>

        {/* Col 3: Stakeholder Hubs */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider mb-3">Stakeholder Hubs</h4>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li><span className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">Donor Dashboard (Restaurants & Caterers)</span></li>
            <li><span className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">NGO & Shelter Claim Portal</span></li>
            <li><span className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">Volunteer Delivery Dispatch</span></li>
            <li><span className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">Platform Operations & Verifications</span></li>
          </ul>
        </div>

        {/* Col 4: Quality Protocols */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider mb-3">Quality Protocols</h4>
          <ul className="space-y-2.5 text-slate-700 dark:text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>FSSAI Hygienic Food Handling Compliant</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>100% Non-Monetary Free Redistribution</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Real-Time Express Cold-Chain Tracking</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between text-slate-500 text-[11px]">
        <p>© 2026 AharSetu Food Redistribution Platform. Built with care to eliminate hunger.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <span className="hover:text-slate-700 dark:hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-400 cursor-pointer">FSSAI Protocols</span>
        </div>
      </div>
    </footer>
  );
};
