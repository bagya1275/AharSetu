import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, Badge } from '../types.js';
import { Trophy, Award, Medal, Crown, Flame, Heart, ShieldCheck, Truck, Users, Sparkles } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setEntries(data.leaderboard || []);
        }
      } catch (err) {
        console.error('Leaderboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-50 dark:bg-green-950/60 text-[#16A34A] dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">
          <Trophy className="w-4 h-4 text-[#16A34A]" />
          Community Hall of Fame
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] dark:text-white">
          Zero Food Waste Champions
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">
          Recognizing top hotel caterers, shelters, and volunteer riders dedicated to zero food waste communities.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-[#E8EEEA] dark:border-slate-800 max-w-2xl mx-auto space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/50 flex items-center justify-center text-[#16A34A] mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#111827] dark:text-white">
            Leaderboard Ready for First Champions!
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            The platform is currently clean and awaiting its first real food rescue operation. Register as a Donor, NGO, or Volunteer to log your first meals and take the #1 rank!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Winners Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {entries.slice(0, 3).map((e, idx) => {
              const ranks = [
                { bg: 'from-amber-400 to-yellow-600 text-slate-950', badge: '🥇 1st Place Champion', border: 'border-amber-400' },
                { bg: 'from-slate-300 to-slate-500 text-slate-950', badge: '🥈 2nd Place Hero', border: 'border-slate-300' },
                { bg: 'from-amber-700 to-yellow-900 text-white', badge: '🥉 3rd Place Pioneer', border: 'border-amber-700' }
              ];
              const style = ranks[idx] || ranks[0];

              return (
                <div
                  key={e.id}
                  className={`relative rounded-3xl bg-white dark:bg-slate-900 border-2 ${style.border} p-6 shadow-xl text-center space-y-4 transform hover:-translate-y-1 transition-all`}
                >
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${style.bg} shadow-md`}>
                    {style.badge}
                  </span>

                  <img
                    src={e.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(e.name)}`}
                    alt={e.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-[#16A34A]/30"
                  />

                  <div>
                    <h3 className="text-lg font-extrabold text-[#111827] dark:text-white">{e.name}</h3>
                    <span className="text-xs text-gray-500 capitalize">{e.organization || e.role}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-green-50/50 dark:bg-slate-800 border border-[#E8EEEA] dark:border-slate-700 flex justify-around text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Impact Score</span>
                      <span className="font-extrabold text-[#16A34A] dark:text-green-400 text-base">{e.impactScore}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Total Meals</span>
                      <span className="font-extrabold text-[#111827] dark:text-white text-base">{e.totalMealsDonated || e.totalDeliveries * 40}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900 border border-[#E8EEEA] dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#111827] dark:text-white">Full Community Rankings</h3>
            <div className="space-y-3">
              {entries.map(e => (
                <div
                  key={e.id}
                  className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center text-base font-extrabold text-gray-400">#{e.rank}</span>
                    <img src={e.avatar} alt={e.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-sm text-[#111827] dark:text-white">{e.name}</h4>
                      <span className="text-xs text-gray-500 capitalize">{e.organization || e.role}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-[#16A34A] dark:text-green-400 text-sm block">{e.impactScore} pts</span>
                    <span className="text-xs text-gray-400">{e.totalMealsDonated || e.totalDeliveries * 40} Meals Saved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
