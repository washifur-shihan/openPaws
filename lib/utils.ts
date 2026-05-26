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
  const fee = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE ?? "70");
  return Number.isFinite(fee) ? fee : 70;
}


export function getDeliveryFeeOutside() {
  const fee = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE_OUTSIDE ?? "130");
  return Number.isFinite(fee) ? fee : 130;
}