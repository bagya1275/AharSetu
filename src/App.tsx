import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { ToastContainer } from './components/ToastContainer.js';
import { NotificationDrawer } from './components/NotificationDrawer.js';
import { RoleSelectionModal } from './components/RoleSelectionModal.js';
import { AuthModal } from './components/AuthModal.js';
import { AuthPage } from './pages/AuthPage.js';
import { RoleSelectionPage } from './pages/RoleSelectionPage.js';
import { LandingPage } from './pages/LandingPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { LeaderboardPage } from './pages/LeaderboardPage.js';
import { DonationFormPage } from './pages/DonationFormPage.js';
import { DonorDashboard } from './pages/DonorDashboard.js';
import { NgoDashboard } from './pages/NgoDashboard.js';
import { RequesterDashboard } from './pages/RequesterDashboard.js';
import { VolunteerDashboard } from './pages/VolunteerDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { DeliveryTrackingPage } from './pages/DeliveryTrackingPage.js';
import { Donation, UserRole } from './types.js';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('auth');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setCurrentPage('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleSelected = (role: UserRole) => {
    if (role !== 'unassigned') {
      const redirectTarget = sessionStorage.getItem('post_login_redirect');
      if (redirectTarget) {
        sessionStorage.removeItem('post_login_redirect');
        setCurrentPage(redirectTarget);
      } else {
        setCurrentPage(`${role}-dashboard`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBFA] dark:bg-slate-950 text-[#1A2E22] dark:text-slate-100 transition-colors">
      
      {/* Top Glass Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenAuthModal={() => handleNavigate('auth')}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {currentPage === 'auth' && (
              <AuthPage onNavigate={handleNavigate} />
            )}

            {(currentPage === 'role-selection' || currentPage === 'role-select') && (
              <RoleSelectionPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'home' && (
              <LandingPage
                onNavigate={handleNavigate}
                onSelectDonation={handleSelectDonation}
              />
            )}

            {currentPage === 'about' && (
              <AboutPage />
            )}

            {currentPage === 'leaderboard' && (
              <LeaderboardPage />
            )}

            {currentPage === 'post-donation' && (
              <DonationFormPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'donor-dashboard' && (
              <DonorDashboard
                onNavigate={handleNavigate}
                onSelectDonation={handleSelectDonation}
              />
            )}

            {currentPage === 'ngo-dashboard' && (
              <NgoDashboard
                onNavigate={handleNavigate}
                onSelectDonation={handleSelectDonation}
              />
            )}

            {currentPage === 'requester-dashboard' && (
              <RequesterDashboard
                onNavigate={handleNavigate}
                onSelectDonation={handleSelectDonation}
              />
            )}

            {currentPage === 'volunteer-dashboard' && (
              <VolunteerDashboard
                onNavigate={handleNavigate}
                onSelectDonation={handleSelectDonation}
              />
            )}

            {currentPage === 'admin-dashboard' && (
              user?.role === 'admin' ? (
                <AdminDashboard
                  onNavigate={handleNavigate}
                  onSelectDonation={handleSelectDonation}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 rounded-3xl text-center space-y-4 shadow-xl">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-950 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    🚫
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Access Restricted</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    The Admin Dashboard is strictly restricted to authorized system administrators.
                  </p>
                  <button
                    onClick={() => handleNavigate('auth')}
                    className="px-5 py-2.5 bg-[#16A34A] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#15803D] cursor-pointer"
                  >
                    Sign In as Admin
                  </button>
                </div>
              )
            )}

            {currentPage === 'tracking' && (
              <DeliveryTrackingPage
                donation={selectedDonation}
                onNavigate={handleNavigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Post-Login Mandatory Role Selection Interceptor */}
      <RoleSelectionModal onRoleSelected={handleRoleSelected} />

      {/* Login / Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Slide-over Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Toast Notifications */}
      <ToastContainer />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
