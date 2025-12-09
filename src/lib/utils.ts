import { clsx, type ClassValue } from "clsx"
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrorMessage(error: any): string {
  return (
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error occurred"
  );
}

export function showToast(type: 'success' | 'error', message: string) {
    toast.dismiss();
    if (type === 'success') toast.success(message);
    else toast.error(message);
}