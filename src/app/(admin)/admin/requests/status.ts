import type { ServiceRequestStatus } from "@/lib/admin";

export const STATUS_STYLES: Record<ServiceRequestStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  contacted: "border-sky-200 bg-sky-50 text-sky-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};
