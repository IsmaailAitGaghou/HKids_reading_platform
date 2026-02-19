/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    case 'time':
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return d.toLocaleDateString();
  }
};

/**
 * Format minutes to readable time
 */
export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Format number with commas (alias for Minimals compatibility)
 */
export const fNumber = (num: number): string => {
  return formatNumber(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, total: number, decimals = 1): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format percent value (alias for Minimals compatibility)
 */
export const fPercent = (percent: number, decimals = 1): string => {
  return `${percent.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Truncate text
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Calculate reading time remaining
 */
export const calculateTimeRemaining = (
  usedMinutes: number,
  dailyLimit: number
): { remaining: number; percentage: number; isLimitReached: boolean } => {
  const remaining = Math.max(0, dailyLimit - usedMinutes);
  const percentage = (usedMinutes / dailyLimit) * 100;
  const isLimitReached = usedMinutes >= dailyLimit;

  return { remaining, percentage, isLimitReached };
};

/**
 * Check if time is within schedule
 */
export const isWithinSchedule = (
  scheduleStart?: string,
  scheduleEnd?: string
): boolean => {
  if (!scheduleStart || !scheduleEnd) return true;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return currentTime >= scheduleStart && currentTime <= scheduleEnd;
};
