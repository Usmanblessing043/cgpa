"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({ orders }: any) {
  const dataMap: Record<string, number> = {};

  orders?.forEach((order: any) => {
    const date = new Date(order.createdAt).toLocaleDateString();

    if (!dataMap[date]) dataMap[date] = 0;
    dataMap[date] += order.total;
  });

  const data = Object.keys(dataMap).map((date) => ({
    date,
    revenue: dataMap[date],
  }));

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h2 className="font-bold mb-4">Revenue Overview</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#f97316" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}