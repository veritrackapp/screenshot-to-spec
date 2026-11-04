export const formatNumber = (n: number) => new Intl.NumberFormat("en-NG").format(n);

export function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${formatNumber(n)}`;
}

export function formatMinutesAgo(minutes: number) {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const h = Math.floor(minutes / 60);
  return `${h} h ago`;
}

export function timeAgo(timestamp: number, now = Date.now()) {
  return formatMinutesAgo(Math.max(0, Math.floor((now - timestamp) / 60_000)));
}
