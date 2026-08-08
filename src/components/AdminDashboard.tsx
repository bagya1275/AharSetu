import React, { useState, useEffect } from 'react';
import { User, Donation } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ShieldAlert, Users, Building2, CheckCircle2, AlertTriangle, Activity, Award, Search, Check, X } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdminEmail = user.email.toLowerCase().trim() === 'bagya1725@gmail.com';

  useEffect(() => {
    api.getAvailableDonations()
      .then(res => {
        if (res.success) setDonations(res.donations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!isAdminEmail) {
    return (
      <div id="admin_restricted_notice" data-testid="admin-restricted-notice" className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto my-12 text-white space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="font-serif text-xl font-bold text-rose-300">Admin Access Restricted</h2>
        <p className="text-xs text-slate-300">
          The Platform Admin portal is strictly restricted to authorized administrator <strong>bagya1725@gmail.com</strong>.
        </p>
      </div>
    );
  }

  return (
    <div id="admin_dashboard" data-testid="admin-dashboard" className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-[11px] font-semibold text-purple-300">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>System Administrator Control Panel</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Welcome, {user.name} ({user.email})
            </h1>
            <p className="text-purple-100/80 text-xs leading-relaxed">
              Full administrative oversight of food rescue operations, NGO verification, user activity, and system metrics.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-4 flex flex-col items-center justify-center text-center flex-shrink-0">
            <Award className="w-6 h-6 text-purple-400 mb-1" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Superadmin Mode</p>
            <p className="text-xs font-bold text-emerald-400">Authorized Access</p>
          </div>
        </div>
      </div>

      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">Total System Users</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">248 Users</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">Verified NGOs</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">42 Shelters</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">Active Couriers</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">68 Volunteers</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white shadow-sm">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">Platform Safety Index</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.8% Perfect</p>
        </div>
      </div>

      {/* Main Admin Data Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Platform Food Redistribution Logs</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by title, donor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-9 pr-3 py-1.5 rounded-xl text-xs outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900/80 uppercase font-bold text-[10px] tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Post Title</th>
                <th className="p-3">Donor Partner</th>
                <th className="p-3">Servings</th>
                <th className="p-3">Pickup Location</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 dark:text-slate-400">
                    No active donation logs found.
                  </td>
                </tr>
              ) : (
                donations
                  .filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.donorName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((d) => (
                    <tr key={d.id || d._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{d.title}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{d.donorName}</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{d.servings} meals</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[180px] truncate">{d.pickupAddress}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer">
                          Inspect Log
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
