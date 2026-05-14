"use client";

import { gql } from "@apollo/client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation } from "@apollo/client/react";
import { Search, Package, LogOut, X, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter()
  const { data, loading, refetch } = useQuery<any>(GET_VENDOR_ORDERS, {
    fetchPolicy: "network-only",
  });

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

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
    in_transit: "bg-red-200 text-red-700",

  };

  const filteredOrders = data?.vendorOrders?.filter((order: any) =>
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.status.toLowerCase().includes(search.toLowerCase())
  );
  const handlelogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      toast.success("Logout successful");
      router.push("/login");
    } catch (err: any) {
      toast.error("Logout failed");
      console.error(err);
    }
  };
  function gotodashboard(params: any) {
    router.push('/vendor')

  }
  return (
    <div className="bg-[#FFF8F1] min-h-screen">

     
       <div className="w-full flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b sticky top-0 backdrop-blur-md z-50">

        {/* LEFT */}
        <div className="flex items-center gap-2 md:gap-3">
          <h1 className="text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">
            SwiftDrop
          </h1>

          <div className="bg-yellow-100 text-orange-500 px-2 md:px-3 py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium outline outline-amber-300">
            Vendor
          </div>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-4 items-center">
          <button
            onClick={gotodashboard}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-black"
          >
            Dashboard
          </button>

          <button
            onClick={handlelogout}
            className="w-10 h-10 rounded-full  flex items-center justify-center hover:bg-red-50 transition"
          >
            <LogOut size={18} />
          </button>
        </div>

      
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden w-10 h-10 rounded-lg border flex items-center justify-center"
        >
          {mobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
 
        {mobileMenu && (
          <div className="absolute top-16 right-4 bg-white border shadow-xl rounded-2xl p-4 flex flex-col gap-3 w-52 md:hidden">

            <button
              onClick={() => {
                gotodashboard("");
                setMobileMenu(false);
              }}
              className="w-full py-3 rounded-xl bg-black text-white text-sm"
            >
              Dashboard
            </button>

            <button
              onClick={() => {
                handlelogout();
                setMobileMenu(false);
              }}
              className="w-full py-3 rounded-xl bg-red-500 text-white text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 py-5">

  {/* TOP BAR */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
      Orders
    </h2>

    {/* SEARCH */}
    <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-3 w-full md:w-80 shadow-sm">

      <Search className="w-4 h-4 text-gray-400 shrink-0" />

      <input
        type="text"
        placeholder="Search by ID or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="outline-none text-sm w-full bg-transparent"
      />
    </div>
  </div>

  {/* LOADING */}
  {loading && (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl shadow animate-pulse space-y-3"
        >
          <div className="h-4 bg-gray-200 w-40 rounded" />
          <div className="h-3 bg-gray-200 w-24 rounded" />
          <div className="h-3 bg-gray-200 w-full rounded" />
        </div>
      ))}
    </div>
  )}

  {/* EMPTY */}
  {!loading && filteredOrders?.length === 0 && (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">

      <div className="bg-orange-50 p-5 rounded-full mb-4 shadow-sm">
        <Package className="w-10 h-10 text-orange-400" />
      </div>

      <h2 className="text-lg font-semibold text-gray-800">
        No orders found
      </h2>

      <p className="text-sm text-gray-500 mt-1 max-w-sm">
        Try searching with a different keyword.
      </p>
    </div>
  )}

  {/* ORDERS */}
  <div className="space-y-4">

    {filteredOrders?.map((order: any) => (
      <div
        key={order.id}
        className="bg-white border rounded-2xl shadow-sm p-4 sm:p-5 hover:shadow-md transition"
      >

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

          <div className="min-w-0">
            <p className="font-semibold text-gray-800 break-all">
              Order: {order.id.slice(-6)}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              ₦{order.total}
            </p>
          </div>

          <span
            className={`w-fit px-3 py-1 text-xs rounded-full font-medium capitalize ${statusColor[order.status]
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
          className="mt-4 text-sm text-orange-500 font-medium hover:text-orange-600"
        >
          {openOrder === order.id
            ? "Hide details"
            : "View details"}
        </button>

        {/* DETAILS */}
        {openOrder === order.id && (
          <div className="mt-5 border-t pt-4 space-y-4">

            {/* ITEMS */}
            <div className="space-y-3">

              {order.items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3"
                >

                  <div className="flex items-center gap-3 min-w-0">

                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        Qty: {item.qty}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-800 shrink-0">
                    ₦{item.price * item.qty}
                  </p>
                </div>
              ))}
            </div>

            {/* ADDRESS */}
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">
                Delivery Address
              </p>

              <p className="text-sm text-gray-600 break-words">
                {order.deliveryAddress}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-2 pt-2">

              {order.status === "pending" && (
                <button
                  onClick={() =>
                    updateStatus(order.id, "confirmed")
                  }
                  className="w-full sm:w-auto px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-xl transition"
                >
                  Confirm Order
                </button>
              )}

              {order.status === "confirmed" && (
                <button
                  onClick={() =>
                    updateStatus(order.id, "preparing")
                  }
                  className="w-full sm:w-auto px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-xl transition"
                >
                  Start Preparing
                </button>
              )}

              {order.status === "preparing" && (
                <button
                  onClick={() =>
                    updateStatus(order.id, "ready_for_pickup")
                  }
                  className="w-full sm:w-auto px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-xs rounded-xl transition"
                >
                  Mark Ready
                </button>
              )}

              {order.status === "ready_for_pickup" && (
                <span className="px-3 py-3 bg-green-100 text-green-700 text-xs rounded-xl font-medium">
                  Waiting for rider
                </span>
              )}

              {order.status === "delivered" && (
                <span className="px-3 py-3 bg-gray-100 text-gray-600 text-xs rounded-xl">
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