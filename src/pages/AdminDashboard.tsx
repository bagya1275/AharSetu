import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { Donation, User, PlatformAnalytics } from '../types.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Utensils, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Send,
  Activity,
  Search,
  FileSpreadsheet
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDonation: (donation: Donation) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onSelectDonation }) => {
  const { showToast } = useNotifications();

  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'ngos' | 'donations'>('analytics');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [anaRes, userRes, donRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/admin/users'),
        fetch('/api/donations')
      ]);

      if (anaRes.ok) setAnalytics((await anaRes.json()).analytics);
      if (userRes.ok) setUsers((await userRes.json()).users);
      if (donRes.ok) setDonations((await donRes.json()).donations);
    } catch (err) {
      console.error('Admin load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      const res = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verified })
      });
      if (res.ok) {
        showToast('Verification Updated', `User status set to ${verified ? 'Verified' : 'Unverified'}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Verify user error', err);
    }
  };

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    showToast('Broadcast Sent!', 'Alert broadcasted to all platform stakeholders.', 'success');
    setBroadcastMessage('');
  };

  const pendingNgos = users.filter(u => u.role === 'ngo' && !u.verified);
  const verifiedNgos = users.filter(u => u.role === 'ngo' && u.verified);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-md text-purple-300 text-xs font-bold border border-purple-400/30">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Central System Operations
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            AharSetu Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/80 max-w-xl">
            Audit NGO credentials, oversee live surplus food allocations, and monitor zero-waste redistribution metrics.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0 text-center">
          <Activity className="w-6 h-6 text-purple-300 mx-auto mb-1" />
          <span className="text-[10px] text-purple-200 block uppercase font-bold">System Status</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            100% Operational
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          System Analytics
        </button>

        <button
          onClick={() => setActiveTab('ngos')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'ngos' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          NGO Approvals ({pendingNgos.length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'donations' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Donation Audit ({donations.length})
        </button>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
              <span className="text-xs text-slate-500 block">Total Meals Served</span>
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {analytics?.totalMealsServed.toLocaleString()}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
              <span className="text-xs text-slate-500 block">Verified NGO Partners</span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                {analytics?.totalNgosVerified}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
              <span className="text-xs text-slate-500 block">Active Volunteer Riders</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {analytics?.totalVolunteersActive}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
              <span className="text-xs text-slate-500 block">CO2 Prevented</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {(analytics ? analytics.co2SavedKg / 1000 : 2.4).toFixed(1)} Tons
              </span>
            </div>
          </div>

          {/* Broadcast Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-md">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              Broadcast System Notification
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                placeholder="e.g. Weather Alert: Heavy rain in South Delhi. Extended expiry window active."
                className="flex-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleBroadcast}
                className="py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NGO Queue Tab */}
      {activeTab === 'ngos' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">NGO Verification Requests</h3>
          <div className="space-y-3">
            {users.filter(u => u.role === 'ngo').map(ngo => (
              <div key={ngo.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ngo.organization || ngo.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ngo.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {ngo.verified ? 'Verified' : 'Pending Review'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{ngo.email} • {ngo.phone} • {ngo.address}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!ngo.verified ? (
                    <button
                      onClick={() => handleVerifyUser(ngo.id, true)}
                      className="py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      Approve NGO
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerifyUser(ngo.id, false)}
                      className="py-2 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                    >
                      Revoke Verification
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donations Audit Tab */}
      {activeTab === 'donations' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">System Surplus Food Log</h3>
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Donor</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {donations.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono text-[10px] text-slate-400">{d.id}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{d.title}</td>
                  <td className="p-3">{d.donorOrg || d.donorName}</td>
                  <td className="p-3">{d.quantityServings} Meals</td>
                  <td className="p-3"><StatusBadge status={d.status} size="sm" /></td>
                  <td className="p-3">
                    <button
                      onClick={() => onSelectDonation(d)}
                      className="text-emerald-600 hover:underline font-bold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
