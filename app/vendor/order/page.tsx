"use client";

import { gql } from "@apollo/client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation } from "@apollo/client/react";
import { Search, Package, LogOut } from "lucide-react";

const GET_VENDOR_ORDERS = gql`
  query {
    vendorOrders {
      id
      total
      status
      deliveryAddress
      createdAt
      items {
        productId
        name
        price
        qty
        image
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation ($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export default function VendorOrdersPage() {
  const { data, loading, refetch } = useQuery<any>(GET_VENDOR_ORDERS, {
    fetchPolicy: "network-only",
  });

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateOrderStatus({ variables: { id, status } });
      toast.success(`Order updated  ${status}`);
      refetch();
    } catch {
      toast.error("Failed to update order");
    }
  };

  const statusColor: any = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    ready_for_pickup: "bg-green-100 text-green-700",
    delivered: "bg-gray-200 text-gray-700",
  };

  const filteredOrders = data?.vendorOrders?.filter((order: any) =>
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#FFF8F1] min-h-screen">

     
      <div className="w-full flex items-center justify-between px-6 py-3 bg-white border-b sticky top-0 backdrop-blur-md z-100">


        <div className="flex items-center gap-3">
          <h1 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">SwiftDrop</h1>

          <div className="bg-yellow-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium outline outline-amber-300">
            Vendor
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

      
      <div className="px-20 py-5 ">

       
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Orders
          </h2>

         
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 w-full md:w-80 shadow-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-sm w-full"
            />
          </div>
        </div>

        
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl shadow animate-pulse space-y-3"
              >
                <div className="h-4 bg-gray-200 w-40 rounded" />
                <div className="h-3 bg-gray-200 w-24 rounded" />
                <div className="h-3 bg-gray-200 w-full rounded" />
              </div>
            ))}
          </div>
        )}

       
        {!loading && filteredOrders?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-orange-50 p-5 rounded-full mb-4 shadow-sm">
              <Package className="w-10 h-10 text-orange-400" />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              No orders found
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Try searching with a different keyword.
            </p>
          </div>
        )}

        {/* ORDERS LIST */}
        <div className="space-y-4">
  {filteredOrders?.map((order: any) => (
    <div
      key={order.id}
      className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition"
    >
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-800">
            Order: {order.id.slice(-6)}
          </p>
          <p className="text-sm text-gray-500">₦{order.total}</p>
        </div>

        <span
          className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${
            statusColor[order.status]
          }`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      {/* VIEW BUTTON */}
      <button
        onClick={() =>
          setOpenOrder(openOrder === order.id ? null : order.id)
        }
        className="mt-3 text-sm text-orange-500 font-medium hover:text-orange-600"
      >
        {openOrder === order.id ? "Hide details" : "View details"}
      </button>

      {/* DETAILS */}
      {openOrder === order.id && (
        <div className="mt-5 border-t pt-4 space-y-4">

          {/* ITEMS */}
          <div className="space-y-2">
            {order.items.map((item: any, i: number) => (
              <div
                key={i}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>
                  {item.name} × {item.qty}
                </span>
                <span className="font-medium">
                  ₦{item.price * item.qty}
                </span>
              </div>
            ))}
          </div>

          {/* ADDRESS */}
          <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
             {order.deliveryAddress}
          </p>

          {/* ACTION PANEL */}
          <div className="flex flex-wrap gap-2 pt-2">

            {order.status === "pending" && (
              <button
                onClick={() => updateStatus(order.id, "confirmed")}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition"
              >
                Confirm Order
              </button>
            )}

            {order.status === "confirmed" && (
              <button
                onClick={() => updateStatus(order.id, "preparing")}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition"
              >
                Start Preparing
              </button>
            )}

            {order.status === "preparing" && (
              <button
                onClick={() =>
                  updateStatus(order.id, "ready_for_pickup")
                }
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition"
              >
                Mark Ready
              </button>
            )}

            {order.status === "ready_for_pickup" && (
              <span className="px-3 py-2 bg-green-100 text-green-700 text-xs rounded-lg font-medium">
                Waiting for rider 
              </span>
            )}

            {order.status === "delivered" && (
              <span className="px-3 py-2 bg-gray-100 text-gray-600 text-xs rounded-lg">
                Delivered 
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  ))}
</div>

      </div>
    </div>
  );
}