"use client";

import React, { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { Users, Package, DollarSign, Truck, Trash2, LogOut,X, Menu } from "lucide-react";
import { useSubscription } from "@apollo/client/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import RevenueChart from "@/components/RevenueChart";
import {
  OrdersPerDayChart,
  RevenuePerDayChart,
  MonthlyRevenueChart,
  RiderActivityChart,
} from "@/components/AdminCharts";


const GET_STATS = gql`
  query {
    adminStats {
      totalUsers
      totalOrders
      totalVendors
      totalRiders
      revenue
    }
  }
`;

const GET_USERS = gql`
  query {
    adminUsers {
      id
      name
      email
      role
      phone
      isBanned
    }
  }
`;

const GET_ORDERS = gql`
  query {
    allOrders {
      id
      total
      status
      deliveryAddress
      createdAt
      

      items {
        name
        qty
      }

      customer {
        name
      }

      vendor {
        businessName
      }

      rider {
        phone
      }
    }
  }
`;

const DELETE_USER = gql`
  mutation ($id: ID!) {
    deleteUser(id: $id)
  }
`;
const BAN_USER = gql`
  mutation ($id: ID!) {
    banUser(id: $id)
  }
`;

const UNBAN_USER = gql`
  mutation ($id: ID!) {
    unbanUser(id: $id)
  }
`;

const NEW_ORDER_SUB = gql`
  subscription {
    newOrder {
      id
      total
      status
      deliveryAddress
      items {
        name
        qty
      }
      customer {
        name
      }
      vendor {
        businessName
      }
      rider {
        phone
      }
    }
  }
`;

const ORDER_UPDATED_SUB = gql`
  subscription {
    orderUpdated {
      id
      status
      total
    }
  }
`;


export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"users" | "orders">("users");
  const [banUser] = useMutation(BAN_USER);
  const [unbanUser] = useMutation(UNBAN_USER);
  const [menuOpen,  setMenuOpen] = useState(false);

  const { data: statsData, loading: statsLoading, } = useQuery<any>(GET_STATS);
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery<any>(GET_USERS);
  const { data: ordersData, loading: ordersLoading, refetch: refetchOrders } = useQuery<any>(GET_ORDERS,
    //   {
    //   pollInterval: 3000,
    // }
  );
  const { data: newOrderData } = useSubscription<any>(NEW_ORDER_SUB);
  const { data: updatedOrderData } = useSubscription<any>(ORDER_UPDATED_SUB);

  const [deleteUser] = useMutation(DELETE_USER);

  const handleBan = async (id: string) => {
    await banUser({ variables: { id } });
    toast.success("User banned");
    refetchUsers();
  };

  const handleUnban = async (id: string) => {
    await unbanUser({ variables: { id } });
    toast.success("User unbanned");
    refetchUsers();
  };

  const stats = statsData?.adminStats;
  useEffect(() => {
    if (newOrderData?.newOrder) {
      toast.success("New order received");

      refetchOrders();
    }
  }, [newOrderData]);
  useEffect(() => {
    if (updatedOrderData?.orderUpdated) {
      toast.success(" Order updated");

      refetchOrders();
    }
  }, [updatedOrderData]);
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

  return (
    <div className="min-h-screen bg-[#FFF8F1]">


      
            <div className="w-full flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b sticky top-0 backdrop-blur-md z-50">
      
              {/* Logo */}
              <div className="flex items-center gap-3">
                <h1 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">
                  SwiftDrop
                </h1>
      
                <div className="bg-yellow-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium outline outline-amber-300">
                  Rider
                </div>
              </div>
      
              {/* Desktop logout */}
              <button
                className="hidden md:flex items-center gap-2 text-gray-700 hover:text-red-500 transition"
                onClick={handlelogout}
              >
                <LogOut size={20} />
      
              </button>
      
              {/* Mobile menu button */}
              <button
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X /> : <Menu />}
              </button>
      
              {/* Mobile dropdown */}
              {menuOpen && (
                <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg w-40 p-3 flex flex-col gap-3 md:hidden z-50">
      
                  <button
                    className="flex items-center justify-center gap-2 text-gray-700 hover:text-red-500"
                    onClick={handlelogout}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
      
                </div>
              )}
            </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 py-6 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          <StatCard icon={Users} label="Users" value={stats?.totalUsers} loading={statsLoading} />
          <StatCard icon={Package} label="Orders" value={stats?.totalOrders} loading={statsLoading} />
          <StatCard icon={Truck} label="Riders" value={stats?.totalRiders} loading={statsLoading} />
          <StatCard icon={DollarSign} label="Revenue" value={`₦${stats?.revenue || 0}`} loading={statsLoading} />

        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-6">
          <OrdersPerDayChart orders={ordersData?.allOrders} />
          <RevenuePerDayChart orders={ordersData?.allOrders} />
          <MonthlyRevenueChart orders={ordersData?.allOrders} />
          <RiderActivityChart orders={ordersData?.allOrders} />
        </div>


        <div className="flex flex-wrap gap-3 border-b pb-3">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-lg text-sm flex-1 sm:flex-none ${
  tab === "users"
    ? "bg-orange-500 text-white"
    : "bg-white border"
}`}
          >
            Users
          </button>

          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm flex-1 sm:flex-none  ${tab === "orders"
              ? "bg-orange-500 text-white"
              : "bg-white border"
              }`}
          >
            Orders
          </button>
        </div>


       {tab === "users" && (
  <>
    {/* DESKTOP TABLE */}
    <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            <th className="px-4 py-3 text-center">Name</th>
            <th className="px-4 py-3 text-center">Email</th>
            <th className="px-4 py-3 text-center">Role</th>
            <th className="px-4 py-3 text-center">Phone</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {usersLoading ? (
            <TableLoader />
          ) : (
            usersData?.adminUsers?.map((user: any) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-center">{user.name}</td>
                <td className="px-4 py-3 text-center">{user.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                    {user.role}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">{user.phone}</td>

                <td className="px-4 py-3 text-center">
                  {user.isBanned ? (
                    <button
                      onClick={() => handleUnban(user.id)}
                      className="text-green-600 border border-green-200 px-3 py-1 rounded-md text-xs hover:bg-green-50"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBan(user.id)}
                      className="text-red-500 border border-red-200 px-3 py-1 rounded-md text-xs hover:bg-red-50"
                    >
                      Ban
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* MOBILE CARDS */}
    <div className="md:hidden space-y-4">
      {usersLoading ? (
        <div className="bg-white rounded-xl p-6 text-center">
          Loading...
        </div>
      ) : (
        usersData?.adminUsers?.map((user: any) => (
          <div
            key={user.id}
            className="bg-white border rounded-2xl p-4 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-gray-800">
                  {user.name}
                </h2>

                <p className="text-sm text-gray-500 break-all">
                  {user.email}
                </p>
              </div>

              <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                {user.role}
              </span>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-600">
                {user.phone}
              </p>
            </div>

            <div className="mt-4">
              {user.isBanned ? (
                <button
                  onClick={() => handleUnban(user.id)}
                  className="w-full py-2 rounded-xl bg-green-50 text-green-600 text-sm"
                >
                  Unban User
                </button>
              ) : (
                <button
                  onClick={() => handleBan(user.id)}
                  className="w-full py-2 rounded-xl bg-red-50 text-red-600 text-sm"
                >
                  Ban User
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </>
)}


       {tab === "orders" && (
  <>
    {/* DESKTOP TABLE */}
    <div className="hidden md:block overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-5 py-4 text-center">Order</th>
            <th className="px-5 py-4 text-center">Customer</th>
            <th className="px-5 py-4 text-center">Vendor</th>
            <th className="px-5 py-4 text-center">Items</th>
            <th className="px-5 py-4 text-center">Rider</th>
            <th className="px-5 py-4 text-center">Status</th>
            <th className="px-5 py-4 text-center">Total</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 text-center">
          {ordersLoading ? (
            <TableLoader />
          ) : (
            ordersData?.allOrders?.map((order: any) => (
              <tr key={order.id}>
                <td className="px-5 py-4">
                  {order.id.slice(-6)}
                </td>

                <td className="px-5 py-4">
                  {order.customer?.name}
                </td>

                <td className="px-5 py-4">
                  {order.vendor?.businessName}
                </td>

                <td className="px-5 py-4">
                  {order.items?.map((i: any, idx: number) => (
                    <div key={idx}>
                      {i.name} × {i.qty}
                    </div>
                  ))}
                </td>

                <td className="px-5 py-4">
                  {order.rider?.phone || "Not assigned"}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-5 py-4 font-bold text-orange-600">
                  ₦{order.total?.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* MOBILE CARDS */}
    <div className="md:hidden space-y-4">
      {ordersLoading ? (
        <div className="bg-white rounded-xl p-6 text-center">
          Loading...
        </div>
      ) : (
        ordersData?.allOrders?.map((order: any) => (
          <div
            key={order.id}
            className="bg-white border rounded-2xl p-4 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">
                  Order: {order.id.slice(-6)}
                </p>

                <p className="text-orange-600 font-bold mt-1">
                  ₦{order.total?.toLocaleString()}
                </p>
              </div>

              <StatusBadge status={order.status} />
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div>
                <span className="font-medium">Customer:</span>{" "}
                {order.customer?.name || "Unknown"}
              </div>

              <div>
                <span className="font-medium">Vendor:</span>{" "}
                {order.vendor?.businessName || "No vendor"}
              </div>

              <div>
                <span className="font-medium">Rider:</span>{" "}
                {order.rider?.phone || "Not assigned"}
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-3 space-y-2">
              {order.items?.map((i: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm"
                >
                  <span>{i.name}</span>
                  <span>x{i.qty}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  </>
)}

      </div>
    </div>
  );
}




function StatCard({ icon: Icon, label, value, loading }: any) {
  return (
    <div className="group relative bg-white p-6 rounded-xl shadow-sm border overflow-hidden transition hover:shadow-md">

      <Icon className="text-orange-500" />

      <p className="text-gray-500 text-sm mt-3">{label}</p>

      {loading ? (
        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded mt-2" />
      ) : (
        <h2 className="text-2xl font-bold text-black mt-2">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h2>
      )}

      <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>
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
    in_transit: "bg-orange-100 text-orange-600",
    delivered: "bg-green-100 text-green-600",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${styles[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
function TableLoader() {
  return (
    <tr>
      <td colSpan={7} className="py-10 text-center">
        <div className="flex justify-center items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      </td>
    </tr>
  );
}