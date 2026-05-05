"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";


const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;
  const key = payload[0].dataKey;

  return (
    <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl px-4 py-3 text-xs min-w-[120px] flex flex-col items-center justify-center">
      
      
      <p className="text-gray-500 text-[11px] mb-1 text-center">
        {label}
      </p>

      
      <p className="font-semibold text-sm text-gray-800 text-center">
        {key === "revenue"
          ? `₦${value.toLocaleString()}`
          : `${value.toLocaleString()} orders`}
      </p>

    </div>
  );
};

export function OrdersPerDayChart({ orders }: any) {
  const map: Record<string, number> = {};

  orders?.forEach((o: any) => {
    const d = new Date(o.createdAt).toLocaleDateString("en-GB");
    map[d] = (map[d] || 0) + 1;
  });

  const data = Object.keys(map).map((date) => ({
    date,
    orders: map[date],
  }));

  return (
    <ChartBox title=" Orders per Day">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#f97316"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}


export function RevenuePerDayChart({ orders }: any) {
  const map: Record<string, number> = {};

  orders?.forEach((o: any) => {
    if (o.status !== "delivered") return;

    const date = new Date(o.createdAt).toLocaleDateString("en-CA");
    map[date] = (map[date] || 0) + Number(o.total || 0);
  });

  const data = Object.keys(map)
    .sort()
    .map((date) => ({
      date,
      revenue: map[date],
    }));

  return (
    <ChartBox title="Revenue per Day">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v) => `₦${v / 1000}k`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#16a34a"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}


export function MonthlyRevenueChart({ orders }: any) {
  const map: Record<string, number> = {};

  orders?.forEach((o: any) => {
    if (o.status !== "delivered") return;

    const key = new Date(o.createdAt)
      .toLocaleDateString("en-CA")
      .slice(0, 7);

    map[key] = (map[key] || 0) + Number(o.total || 0);
  });

  const data = Object.keys(map)
    .sort()
    .map((month) => ({
      month,
      revenue: map[month],
    }));

  return (
    <ChartBox title="Monthly Revenue">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v) => `₦${v / 1000}k`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="#f97316" />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}


export function RiderActivityChart({ orders }: any) {
  const map: Record<string, number> = {};

  orders?.forEach((o: any) => {
    const rider = o.rider?.phone || "Unassigned";
    map[rider] = (map[rider] || 0) + 1;
  });

  const data = Object.keys(map).map((rider) => ({
    rider,
    orders: map[rider],
  }));

  return (
    <ChartBox title=" Rider Activity">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="rider" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 12 }} />
         <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="orders" fill="#6366f1" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}


function ChartBox({ title, children }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}