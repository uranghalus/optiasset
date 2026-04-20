/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge'; // sesuaikan path
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5; // Maximum number of page buttons to show
  const rangeWithDots = [];

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i);
    }
  } else {
    // Always show first page
    rangeWithDots.push(1);

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i);
      }
      rangeWithDots.push('...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i);
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i);
      }
      rangeWithDots.push('...', totalPages);
    }
  }

  return rangeWithDots;
}
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;

  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
}

/**
 * Recursively converts Prisma Decimal objects into plain numbers/strings
 * so they can be passed to Client Components.
 */
export function serializePrisma<T>(data: T): T {
  if (data === null || data === undefined) return data;

  // Array
  if (Array.isArray(data)) {
    return data.map((item) => serializePrisma(item)) as unknown as T;
  }

  // Decimal detection — multiple strategies to survive minification:
  // 1. constructor name includes 'decimal'
  // 2. has toDecimalPlaces (unique to decimal.js / Prisma Decimal)
  // 3. has toNumber + toString but is NOT a plain number
  if (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as any).toNumber === 'function' &&
    ((data as any).constructor?.name?.toLowerCase().includes('decimal') ||
      typeof (data as any).toDecimalPlaces === 'function' ||
      typeof (data as any).isFinite === 'function')
  ) {
    return (data as any).toNumber() as unknown as T;
  }

  // Date
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }

  // Plain object
  if (typeof data === 'object') {
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializePrisma((data as any)[key]);
      }
    }
    return serialized as T;
  }

  return data;
}

/**
 * Convert File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function isValidImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedMimes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format file harus berupa JPG, PNG, WebP, atau GIF',
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: 'Ukuran file tidak boleh melebihi 5MB',
    };
  }

  return { valid: true };
}
