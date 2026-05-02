import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price) {
  return `৳${Number(price).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function validateBDPhone(phone) {
  const regex = /^01[3-9]\d{8}$/;
  return regex.test(phone);
}