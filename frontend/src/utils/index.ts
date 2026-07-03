export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const formatPrice = (price: number, currency = 'INR') => {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDuration = (minutes: number): string => {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    development: 'Development',
    design: 'Design',
    business: 'Business',
    marketing: 'Marketing',
    photography: 'Photography',
    music: 'Music',
    health: 'Health & Fitness',
    finance: 'Finance',
    language: 'Language',
    other: 'Other',
  };
  return labels[category] || category;
};

export const getLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return labels[level] || level;
};

export const getLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    development: 'bg-blue-100 text-blue-700',
    design: 'bg-purple-100 text-purple-700',
    business: 'bg-green-100 text-green-700',
    marketing: 'bg-orange-100 text-orange-700',
    photography: 'bg-pink-100 text-pink-700',
    music: 'bg-indigo-100 text-indigo-700',
    health: 'bg-teal-100 text-teal-700',
    finance: 'bg-yellow-100 text-yellow-700',
    language: 'bg-cyan-100 text-cyan-700',
    other: 'bg-gray-100 text-gray-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

export const getAvatarUrl = (avatar: string, firstName: string, lastName: string): string => {
  if (avatar) return avatar;
  const initials = getInitials(firstName || 'U', lastName || 'U');
  return `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&size=128&bold=true`;
};

export const extractApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || 'An error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};
