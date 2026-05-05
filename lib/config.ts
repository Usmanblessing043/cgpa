import {
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Truck,
  Home,
  XCircle,
} from "lucide-react";

export const statusConfig: any = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-gray-500",
    bg: "bg-gray-100",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  preparing: {
    label: "Preparing",
    icon: ChefHat,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  ready_for_pickup: {
    label: "Ready",
    icon: PackageCheck,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  in_transit: {
    label: "On the way",
    icon: Truck,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  delivered: {
    label: "Delivered",
    icon: Home,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-100",
  },
};