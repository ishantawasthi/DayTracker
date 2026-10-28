export const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const today = getTodayString();
  const tomorrow = getTomorrowString();

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const formatFullDate = (d = new Date()) => {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getGreeting = (name = 'there') => {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  if (hour < 21) return `Good evening, ${name}`;
  return `Rest well tonight, ${name}`;
};

export const MOTIVATIONAL_QUOTES = [
  "Small daily habits lead to staggering long-term results.",
  "Discipline is choosing between what you want now and what you want most.",
  "Balance your 10-7 job with 2 hours of self-investment, and your future will thank you.",
  "Focus on being productive instead of busy.",
  "One solved DSA problem today is infinite confidence tomorrow.",
  "Consistency beats talent every single day.",
  "You don't need more time, you need focused clarity."
];

export const getRandomQuote = () => {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
};
