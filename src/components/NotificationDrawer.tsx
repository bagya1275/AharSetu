import React from 'react';
import { useNotifications } from '../context/NotificationContext.js';
import { X, CheckCheck, Bell, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { notifications, markAsRead, unreadCount } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-emerald-900/10 dark:border-slate-800"
          >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">Notifications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No notifications yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Updates regarding food claims and deliveries will appear here.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) markAsRead(n.id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                    : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm font-semibold ${n.read ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-950 dark:text-emerald-300'}`}>
                    {n.title}
                  </h4>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};
