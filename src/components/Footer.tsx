import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { LogoMark } from './LogoMark.js';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#1A2E22] text-slate-300 border-t border-[#E8EEEA] dark:border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <LogoMark size="md" variant="dark" />
            <p className="text-xs text-slate-300/80 leading-relaxed">
              India's premier 100% donation-based smart food rescue network connecting hotel caterers, restaurants, and individuals with verified NGOs and shelters.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#16A34A] font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              100% Non-Monetary Ecosystem
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-300/80">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#16A34A] transition-colors">
                  Home Landing Page
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#16A34A] transition-colors">
                  Mission & Vision
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('leaderboard')} className="hover:text-[#16A34A] transition-colors">
                  Community Leaderboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('post-donation')} className="hover:text-[#16A34A] transition-colors">
                  Post Food Donation
                </button>
              </li>
            </ul>
          </div>

          {/* Dashboards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Stakeholder Hubs</h4>
            <ul className="space-y-2 text-xs text-slate-300/80">
              <li>
                <button onClick={() => onNavigate('donor-dashboard')} className="hover:text-[#16A34A] transition-colors">
                  Donor Dashboard (Restaurants & Caterers)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ngo-dashboard')} className="hover:text-[#16A34A] transition-colors">
                  NGO & Shelter Claim Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('volunteer-dashboard')} className="hover:text-[#16A34A] transition-colors">
                  Volunteer Delivery Dispatch
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-[#16A34A] transition-colors">
                  Platform Operations & Verifications
                </button>
              </li>
            </ul>
          </div>

          {/* Quality & Safety Commitments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quality Protocols</h4>
            <div className="space-y-2 text-xs text-slate-300/80">
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                FSSAI Hygenic Food Handling Compliant
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                100% Non-Monetary Free Redistribution
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                Real-Time Express Cold-Chain Tracking
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AharSetu Food Redistribution Platform. Built with care to eliminate hunger.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">FSSAI Protocols</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
