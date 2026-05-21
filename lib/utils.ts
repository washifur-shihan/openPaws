import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTk(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(value);
}

export function getDeliveryFee() {
  const fee = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE ?? "80");
  return Number.isFinite(fee) ? fee : 80;
}
