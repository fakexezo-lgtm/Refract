import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for merging tailwind classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const isIframe = typeof window !== 'undefined' && window.self !== window.top;

/**
 * Formats a number as USD currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Creates a URL slug from a page name
 */
export function createPageUrl(pageName) {
  return '/' + pageName.toString().replace(/ /g, '-');
}
