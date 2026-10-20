/**
 * Compact relative time formatter for Techno Talent Feast 2026.
 * Format examples requested:
 * - < 60s: '1sec', '15sec'
 * - < 60m: '1min', '10 min', '45 min'
 * - < 24h: '1 hr', '2hrs', '5hrs'
 * - >= 24h: '1day', '2days'
 */
export function formatRelativeTime(timestamp: string | number | Date | undefined | null): string {
  if (!timestamp) return '1sec';

  let date: Date;

  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    // If it's already a relative string from legacy data like "15 min ago", convert or keep
    const trimmed = timestamp.trim();
    if (trimmed === 'Just now') return '1sec';
    if (trimmed.endsWith('min ago')) {
      const mins = parseInt(trimmed.replace('min ago', '').trim(), 10);
      return isNaN(mins) ? '1min' : mins === 1 ? '1min' : `${mins} min`;
    }

    // Try parsing as ISO or date string
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      date = new Date(parsed);
    } else {
      // Check if it's a time like "04:27 pm"
      const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
      if (match) {
        const today = new Date();
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const meridiem = match[3].toLowerCase();
        if (meridiem === 'pm' && hours < 12) hours += 12;
        if (meridiem === 'am' && hours === 12) hours = 0;
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);
      } else {
        return trimmed;
      }
    }
  } else {
    return '1sec';
  }

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.max(1, Math.floor(diffInMs / 1000));

  if (diffInSeconds < 60) {
    return `${diffInSeconds}sec`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1min' : `${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hr' : `${diffInHours}hrs`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return diffInDays === 1 ? '1day' : `${diffInDays}days`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return diffInMonths === 1 ? '1mo' : `${diffInMonths}mos`;
}
