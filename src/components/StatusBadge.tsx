import React from 'react';
import { DonationStatus } from '../types.js';

interface StatusBadgeProps {
  status: DonationStatus;
  pickupMethod?: 'self_pickup' | 'volunteer';
  volunteerId?: string;
  volunteerName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  pickupMethod, 
  volunteerId, 
  volunteerName, 
  size = 'md' 
}) => {
  let labelOverride: string | null = null;
  let bgOverride: string | null = null;
  let textOverride: string | null = null;
  let borderOverride: string | null = null;
  let dotOverride: string | null = null;

  const hasVolunteer = Boolean(volunteerId || volunteerName);

  if (pickupMethod === 'volunteer') {
    if (status === 'accepted' && !hasVolunteer) {
      labelOverride = 'Waiting for volunteer acceptance';
      bgOverride = 'bg-amber-50 dark:bg-amber-950/40';
      textOverride = 'text-amber-800 dark:text-amber-300';
      borderOverride = 'border-amber-200 dark:border-amber-800/50';
      dotOverride = 'bg-amber-500 animate-pulse';
    } else if (status === 'assigned' || (status === 'accepted' && hasVolunteer)) {
      labelOverride = 'Will be picked up by a volunteer';
      bgOverride = 'bg-purple-50 dark:bg-purple-950/40';
      textOverride = 'text-purple-800 dark:text-purple-300';
      borderOverride = 'border-purple-200 dark:border-purple-800/50';
      dotOverride = 'bg-purple-500';
    } else if (status === 'picked_up') {
      labelOverride = 'In Transit';
      bgOverride = 'bg-emerald-50 dark:bg-emerald-950/40';
      textOverride = 'text-emerald-700 dark:text-emerald-300';
      borderOverride = 'border-emerald-200 dark:border-emerald-800/50';
      dotOverride = 'bg-emerald-500 animate-pulse';
    } else if (status === 'delivered') {
      labelOverride = 'Delivered & Saved';
      bgOverride = 'bg-emerald-100 dark:bg-emerald-900/50';
      textOverride = 'text-emerald-800 dark:text-emerald-200';
      borderOverride = 'border-emerald-300 dark:border-emerald-700';
      dotOverride = 'bg-emerald-600';
    }
  } else if (pickupMethod === 'self_pickup') {
    if (status === 'accepted') {
      labelOverride = 'Self Pickup Claimed';
    } else if (status === 'picked_up') {
      labelOverride = 'Self Pickup Completed';
    }
  }

  const config: Record<DonationStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
    draft: {
      label: 'Draft',
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
    },
    pending: {
      label: 'Pending Pickup',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500 animate-pulse',
      border: 'border-amber-200 dark:border-amber-800/50',
    },
    accepted: {
      label: labelOverride || 'Claimed',
      bg: bgOverride || 'bg-blue-50 dark:bg-blue-950/40',
      text: textOverride || 'text-blue-700 dark:text-blue-300',
      dot: dotOverride || 'bg-blue-500',
      border: borderOverride || 'border-blue-200 dark:border-blue-800/50',
    },
    assigned: {
      label: labelOverride || 'Will be picked up by a volunteer',
      bg: bgOverride || 'bg-purple-50 dark:bg-purple-950/40',
      text: textOverride || 'text-purple-700 dark:text-purple-300',
      dot: dotOverride || 'bg-purple-500',
      border: borderOverride || 'border-purple-200 dark:border-purple-800/50',
    },
    picked_up: {
      label: 'In Transit',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500 animate-pulse',
      border: 'border-emerald-200 dark:border-emerald-800/50',
    },
    delivered: {
      label: 'Delivered & Saved',
      bg: 'bg-emerald-100 dark:bg-emerald-900/50',
      text: 'text-emerald-800 dark:text-emerald-200',
      dot: 'bg-emerald-600',
      border: 'border-emerald-300 dark:border-emerald-700',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-800/50',
    },
  };

  const current = config[status] || config.pending;

  const displayLabel = labelOverride || current.label;
  const displayBg = bgOverride || current.bg;
  const displayText = textOverride || current.text;
  const displayBorder = borderOverride || current.border;
  const displayDot = dotOverride || current.dot;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-semibold gap-2',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${displayBg} ${displayText} ${displayBorder} ${sizeClasses[size]} transition-all shadow-xs`}>
      <span className={`h-2 w-2 rounded-full ${displayDot}`} />
      {displayLabel}
    </span>
  );
};
