import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types/index.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { RoleSelectionModal } from './components/RoleSelectionModal.tsx';
import { DonorDashboard } from './components/DonorDashboard.tsx';
import { NGODashboard } from './components/NGODashboard.tsx';
import { VolunteerDashboard } from './components/VolunteerDashboard.tsx';
import { RequesterDashboard } from './components/RequesterDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { PostDonationModal } from './components/PostDonationModal.tsx';
import { MissionModal, ImpactModal, NGOsModal } from './components/NavModals.tsx';
import { UtensilsCrossed, Building2, Bike, HeartHandshake, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('DONOR');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [activeNavModal, setActiveNavModal] = useState<'mission' | 'impact' | 'ngos' | null>(null);

  // Check auth session on mount and sync theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('aharsetu_token');
    if (token) {
      api.getMe().then((res) => {
        if (res.success && res.user) {
          setUser(res.user);
          if (res.user.role && res.user.role !== 'UNASSIGNED') {
            setActiveRole(res.user.role as UserRole);
          }
        } else {
          localStorage.removeItem('aharsetu_token');
        }
      }).catch(() => {
        localStorage.removeItem('aharsetu_token');
      });
    }
  }, []);

  const handleAuthSuccess = (userData: User, token: string) => {
    setUser(userData);
    setAuthModalOpen(false);
    if (userData.role && userData.role !== 'UNASSIGNED') {
      setActiveRole(userData.role);
    }
  };

  const handleRoleSet = (updatedUser: User) => {
    setUser(updatedUser);
    setActiveRole(updatedUser.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('aharsetu_token');
    setUser(null);
    setActiveRole('DONOR');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isRoleUnassigned = user && user.role === 'UNASSIGNED';

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#080c14] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header */}
      <Navbar
        user={user}
        activeRole={activeRole}
        onSelectRole={(role) => setActiveRole(role)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenModal={(view) => setActiveNavModal(view)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {user ? (
          /* Logged In Dashboard Views */
          <div>
            {activeRole === 'DONOR' && (
              <DonorDashboard user={user} onOpenPostModal={() => setPostModalOpen(true)} />
            )}

            {activeRole === 'NGO' && (
              <NGODashboard user={user} />
            )}

            {activeRole === 'VOLUNTEER' && (
              <VolunteerDashboard user={user} />
            )}

            {activeRole === 'REQUESTER' && (
              <RequesterDashboard user={user} />
            )}

            {activeRole === 'ADMIN' && (
              <AdminDashboard user={user} />
            )}
          </div>
        ) : (
          /* Public Guest View / Hero Landing */
          <div className="space-y-12 py-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 dark:from-[#0e1726] dark:via-[#09101d] dark:to-[#05080f] border border-emerald-500/20 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="max-w-3xl space-y-6 relative z-10">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Zero Food Waste Smart Network</span>
                </div>

                <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight tracking-tight">
                  Connecting Hotels, Caterers & Individuals with Verified Shelters
                </h1>

                <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                  AharSetu is India's 100% donation-based smart food rescue platform. Post surplus fresh food in 30 seconds or claim meals with express volunteer delivery.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <button
                    id="hero_get_started_btn"
                    data-testid="hero-get-started-btn"
                    onClick={() => setAuthModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Get Started - Sign In / Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="hero_our_mission_btn"
                    onClick={() => setActiveNavModal('mission')}
                    className="bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-100 font-semibold px-6 py-3.5 rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Read Our Mission</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stakeholder Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div 
                onClick={() => setAuthModalOpen(true)} 
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl cursor-pointer transition space-y-3 group shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Food Donors</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Hotels, caterers, banquets & individuals post extra surplus meals for instant local shelter rescue.</p>
              </div>

              <div 
                onClick={() => setAuthModalOpen(true)} 
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl cursor-pointer transition space-y-3 group shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">NGO & Shelters</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Verified non-profits claim hot meals with 1-click and receive express delivery at zero cost.</p>
              </div>

              <div 
                onClick={() => setAuthModalOpen(true)} 
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 p-6 rounded-2xl cursor-pointer transition space-y-3 group shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition">
                  <Bike className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Volunteer Heroes</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Delivery riders pick up fresh food from donors and transport safely using live route maps.</p>
              </div>

              <div 
                onClick={() => setAuthModalOpen(true)} 
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 p-6 rounded-2xl cursor-pointer transition space-y-3 group shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-400/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Food Requesters</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Direct community meal requesters and night shelter managers submit custom food requirements.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Mandatory Role Selection Interceptor Modal for UNASSIGNED users */}
      {isRoleUnassigned && (
        <RoleSelectionModal
          isOpen={true}
          user={user}
          onRoleSet={handleRoleSet}
        />
      )}

      {/* Post Donation Modal */}
      <PostDonationModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onDonationCreated={(newDonation) => {
          // Trigger refresh by updating state or calling refetch
          setPostModalOpen(false);
          window.location.reload();
        }}
      />

      {/* Header Nav Info Modals */}
      <MissionModal isOpen={activeNavModal === 'mission'} onClose={() => setActiveNavModal(null)} />
      <ImpactModal isOpen={activeNavModal === 'impact'} onClose={() => setActiveNavModal(null)} />
      <NGOsModal isOpen={activeNavModal === 'ngos'} onClose={() => setActiveNavModal(null)} />
    </div>
  );
}
