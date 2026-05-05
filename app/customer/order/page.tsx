"use client"
import React from 'react'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import { Package, Search, ChevronDown, LogOut,Clock, CheckCircle2, ChefHat, PackageCheck, Truck, Home, XCircle, } from "lucide-react";
import { useState, useEffect } from 'react';
import { statusConfig } from '@/lib/config';
import { motion } from "framer-motion";





const GET_MY_ORDERS = gql`
  query {
    myOrders {
      id
      total
      status
      deliveryAddress
      createdAt
       statusHistory {
        status
        time
      }
      items {
        name
        qty
        image
        price
      }
    }
  }
`;

type Order = {
  id: string;
  total: number;
  status: string;
  deliveryAddress: string;
  createdAt: string;
  items: {
    name: string;
    qty: number;
    price: number;
    image: string;
  }[];
};

type MyOrdersResponse = {
  myOrders: Order[];
};
export default function MyOrders() {
  const { data, loading } = useQuery<MyOrdersResponse>(GET_MY_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const options = [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Preparing", value: "preparing" },
    { label: "Ready", value: "ready_for_pickup" },
    { label: "In Transit", value: "in_transit" },
    { label: "Delivered", value: "delivered" },
  ];


  
const timeAgo = (t?: string) => {
  if (!t) return "No time";

  const date = new Date(t);

  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    year: "2-digit"
  });
};




  const filteredOrders = data?.myOrders?.filter((order: Order) => {
    const matchesSearch =
      order.deliveryAddress.toLowerCase().includes(search.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  return (
    <div className="min-h-screen bg-[#FFF8F1]">



      <div className="w-full flex items-center justify-between px-6 py-3 bg-white border-b sticky top-0 backdrop-blur-md z-100">


        <div className="flex items-center gap-3">
          <h1 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">SwiftDrop</h1>

          <div className="bg-yellow-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium outline outline-amber-300">
            Customer
          </div>
        </div>

        <div className='flex gap-4 items-center'>
          <button
            
            className="px-4 py-2 text-sm font-medium text-white  rounded-lg  bg-black"
          >
            Dashboard
          </button>
          <div> <LogOut></LogOut></div>
        </div>
      </div>
      <div className="flex items-center px-6 py-4 justify-between">
        <p className="text-2xl font-semibold">Order History</p>

        <div className="flex gap-3 items-center">
          {/* SEARCH BOX */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 w-64 border rounded-lg text-sm outline-none 
        focus:ring-2 focus:ring-orange-400 bg-white shadow-sm"
            />
          </div>
          <div className="relative w-48">
            {/* SELECT BUTTON */}
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white shadow-sm text-sm"
            >
              <span>
                {options.find((o) => o.value === statusFilter)?.label}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                {options.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setOpen(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-orange-50 ${statusFilter === opt.value
                      ? "bg-orange-100 text-orange-600 font-medium"
                      : ""
                      }`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>






      <div className='px-30 space-y-3'>

        {loading ? (
  
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow border p-5 space-y-4 animate-pulse"
            >
             
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                  <div className="h-2 w-20 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
              </div>

              
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-5/6 bg-gray-200 rounded" />
              </div>

              
              <div className="h-3 w-2/3 bg-gray-200 rounded" />

              
              <div className="flex justify-between pt-3">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>

              
              <div className="flex justify-between mt-4">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="w-4 h-4 bg-gray-200 rounded-full" />
                ))}
              </div>
            </div>
          ))
        ) : filteredOrders?.length === 0 ? (

          
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-orange-50 p-5 rounded-full mb-4 shadow-sm">
              <Package className="w-10 h-10 text-orange-400" />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              No orders yet
            </h2>

            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Looks like you haven’t placed any orders.
            </p>

            <button className="mt-5 px-5 py-2.5 bg-orange-500 text-white text-sm rounded-lg shadow hover:bg-orange-600 transition">
              Browse Vendors
            </button>
          </div>

        ) : (

          // REAL DATA
          filteredOrders?.map((order: any) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow border p-5 space-y-4"
            >
              {/* TOP */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID: {order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {timeAgo(order.createdAt)}
                  </p>
                </div>

                <StatusBadge status={order.status} />
              </div>

              {/* ITEMS */}
              <div className="space-y-2">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.qty}
                    </span>
                    <span>₦{item.price * item.qty}</span>
                  </div>
                ))}
              </div>


              {/* ADDRESS */}
              <div className="text-sm text-gray-500">
                {order.deliveryAddress}
              </div>

              {/* TOTAL */}
              <div className="flex justify-between font-semibold border-t pt-3">
                <span>Total</span>
                <span className="text-orange-500">₦{order.total}</span>
              </div>

              {/* TRACKING BAR */}
             <OrderProgress history={order.statusHistory} />
            </div>
          ))

        )}

      </div>





    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-gray-200 text-gray-700",
    confirmed: "bg-blue-100 text-blue-600",
    preparing: "bg-yellow-100 text-yellow-600",
    ready_for_pickup: "bg-purple-100 text-purple-600",
    accepted: "bg-indigo-100 text-indigo-600",
    picked_up: "bg-orange-100 text-orange-600",
    in_transit: "bg-orange-200 text-orange-700",
    delivered: "bg-green-100 text-green-600",
  };
  

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
const formatTime = (t?: string) => {
  if (!t) return "No time";

  const date = new Date(t);

  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
     year: "2-digit"
  });
};
function OrderProgress({ history }: { history: any[] }) {
  if (!history?.length) return null;

  return (
    <div className="mt-4 relative">

      {/* FULL VERTICAL LINE (background) */}
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200" />

      <div className="space-y-6">
        {history.map((h, i) => {
          const config = statusConfig[h.status] || statusConfig.pending;
          const Icon = config.icon;

          return (
            <div key={i} className="flex items-start gap-3 relative">

              {/* ICON */}
              <div
                className={`z-10 w-9 h-9 flex items-center justify-center rounded-full ${config.bg}`}
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>

              {/* CONTENT */}
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm capitalize">
                    {config.label}
                  </p>

                  <p className="text-[11px] text-gray-400">
                    {formatTime(h.time)}
                  </p>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}