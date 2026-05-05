"use client";

import React, { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { Users, Package, DollarSign, Truck, Trash2, LogOut } from "lucide-react";
import { useSubscription } from "@apollo/client/react";
import toast from "react-hot-toast";
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
  const [tab, setTab] = useState<"users" | "orders">("users");
  const [banUser] = useMutation(BAN_USER);
  const [unbanUser] = useMutation(UNBAN_USER);

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

  return (
    <div className="min-h-screen bg-[#FFF8F1]">


      <div className="w-full flex items-center justify-between px-6 py-3 bg-white border-b   sticky top-0 backdrop-blur-md z-100">


        <div className="flex items-center gap-3">
          <h1 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">SwiftDrop</h1>

          <div className="bg-yellow-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium outline outline-amber-300">
            Admin
          </div>
        </div>


        <div><LogOut></LogOut></div>
      </div>

      <div className="px-10 py-6 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <StatCard icon={Users} label="Users" value={stats?.totalUsers} loading={statsLoading} />
          <StatCard icon={Package} label="Orders" value={stats?.totalOrders} loading={statsLoading} />
          <StatCard icon={Truck} label="Riders" value={stats?.totalRiders} loading={statsLoading} />
          <StatCard icon={DollarSign} label="Revenue" value={`₦${stats?.revenue || 0}`} loading={statsLoading} />

        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <OrdersPerDayChart orders={ordersData?.allOrders} />
          <RevenuePerDayChart orders={ordersData?.allOrders} />
          <MonthlyRevenueChart orders={ordersData?.allOrders} />
          <RiderActivityChart orders={ordersData?.allOrders} />
        </div>


        <div className="flex gap-4 border-b pb-2">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-lg text-sm ${tab === "users"
              ? "bg-orange-500 text-white"
              : "bg-white border"
              }`}
          >
            Users
          </button>

          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm ${tab === "orders"
              ? "bg-orange-500 text-white"
              : "bg-white border"
              }`}
          >
            Orders
          </button>
        </div>


        {tab === "users" && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase ">
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
        )}


        {tab === "orders" && (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-sm">

              {/* HEADER */}
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
                  <tr>
                    <td colSpan={7} className="py-10">
                      <div className="flex justify-center items-center gap-2 text-gray-500">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading
                      </div>
                    </td>
                  </tr>
                ) : (
                  ordersData?.allOrders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-orange-50/40 transition align-middle">
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">
                          {order.id.slice(-6)}
                        </span>
                      </td>

                      <td className="px-5 py-4">{order.customer?.name || "Unknown"}</td>
                      <td className="px-5 py-4">{order.vendor?.businessName || "No vendor"}</td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-center gap-1">
                          {order.items?.map((i: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-xs bg-gray-50 px-2 py-1 rounded-md"
                            >
                              {i.name} × {i.qty}
                            </div>
                          ))}
                        </div>
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