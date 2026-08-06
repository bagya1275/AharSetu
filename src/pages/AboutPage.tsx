import React from 'react';
import { Heart, ShieldCheck, Truck, Building2, Utensils, Award, Target, Eye } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
          About AharSetu
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100">
          Bridging Surplus Food to Souls in Need
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          "AharSetu" (Food Bridge) is a non-monetary, tech-driven food redistribution ecosystem designed to systematically eliminate commercial food waste and feed underserved communities.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Our Mission</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            To redirect every single edible meal from hotel banquet halls, catering companies, and food courts directly to children's homes, eldercare shelters, and night shelters before it spoils.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Our Vision</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            A zero-hunger, zero-landfill food ecosystem across India where smart real-time logistics eliminate the paradox of hunger coexisting with massive food waste.
          </p>
        </div>
      </div>

      {/* Why AharSetu Matters */}
      <div className="p-10 rounded-3xl bg-emerald-900 text-white space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center">The Food Waste Paradox</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs sm:text-sm text-emerald-100/90">
          <div className="space-y-1">
            <span className="text-3xl font-black text-emerald-400 block">68 Million</span>
            <span>Tons of food wasted in India annually</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black text-emerald-400 block">190 Million</span>
            <span>People go undernourished daily</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black text-emerald-400 block">100% Free</span>
            <span>Zero-cost non-monetary tech network</span>
          </div>
        </div>
      </div>

    </div>
  );
};
