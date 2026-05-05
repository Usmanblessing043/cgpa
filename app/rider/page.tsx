"use client"
import React from 'react'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react';
import { useState, useEffect } from 'react';
import { DollarSign, Clock, Bike, CircleCheckBig, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { TailSpin } from "react-loader-spinner";
import toast from 'react-hot-toast';




type MeResponse = {
  me: {
    name: string;
    role: string;
    businessType: string
  };
};

const ME = gql`
  query {
    me {
      name
      role
       businessType
    }
  }
`;

const GET_AVAILABLE_ORDERS = gql`
  query {
    riderOrders {
      id
      total
      deliveryAddress
      status
      items {
        name
        qty
      }
    }
  }
`;
const GET_MY_DELIVERIES = gql`
  query {
    myRiderOrders {
      id
      total
      deliveryAddress
      status
      items {
        name
        qty
      }
    }
  }
`;
const ACCEPT_ORDER = gql`
  mutation ($id: ID!) {
    acceptOrder(id: $id) {
      id
      status
    }
  }
`;

const REJECT_ORDER = gql`
  mutation ($id: ID!) {
    rejectOrder(id: $id) {
      id
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation ($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;
const GET_COMPLETED = gql`
  query {
    completedRiderOrders {
      id
      total
      deliveryAddress
      status
      items {
        name
        qty
      }
      
    }
  }
`;

const SEND_OTP = gql`
  mutation ($id: ID!) {
    sendDeliveryOTP(id: $id)
  }
`;

const VERIFY_OTP = gql`
  mutation ($id: ID!, $otp: String!) {
    verifyDeliveryOTP(id: $id, otp: $otp) {
      id
      status
    }
  }
`;
type Item = {
  name: string;
  qty: number;
};

type Order = {
  id: string;
  total: number;
  deliveryAddress: string;
  status: string;
  items: Item[];
};
type RiderOrdersResponse = {
  riderOrders: Order[];
};

type MyRiderOrdersResponse = {
  myRiderOrders: Order[];
};
type CompletedResponse = {
  completedRiderOrders: Order[];
};
export default function RiderPage() {
  const [userName, setUserName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const { data: meData } = useQuery<MeResponse>(ME);
  const { data, refetch } = useQuery<RiderOrdersResponse>(GET_AVAILABLE_ORDERS);
  const { data: myData, refetch: refetchMy } = useQuery<MyRiderOrdersResponse>(GET_MY_DELIVERIES);
  const [sendOTP] = useMutation(SEND_OTP);
  const [verifyOTP] = useMutation(VERIFY_OTP);
  const [acceptOrder] = useMutation(ACCEPT_ORDER);
  const [rejectOrder] = useMutation(REJECT_ORDER);
  const [updateStatus] = useMutation(UPDATE_STATUS, {
    refetchQueries: [
      { query: GET_MY_DELIVERIES },
      { query: GET_AVAILABLE_ORDERS },
      { query: GET_COMPLETED },
    ],
    awaitRefetchQueries: true,
  });
  const { data: completedData } = useQuery<CompletedResponse>(GET_COMPLETED);

  const completedOrders = completedData?.completedRiderOrders || [];

  useEffect(() => {
    if (meData?.me?.name) {
      setUserName(meData.me.name.toUpperCase());
    }
  }, [meData]);



  const handleAccept = async (id: string) => {
    await acceptOrder({ variables: { id } });
    toast.success("Order accepted ");
    refetch();
    refetchMy();
  };

  const handleReject = async (id: string) => {
    await rejectOrder({ variables: { id } });
    toast("Order rejected");
    refetch();
  };

  const markDelivered = async (id: string) => {
    await updateStatus({ variables: { id, status: "delivered" } });
    toast.success("Delivered ");

  };

  const availableOrders = data?.riderOrders || [];
  const myOrders = myData?.myRiderOrders || [];
 const handleSendOTP = async (id: string) => {
  await sendOTP({ variables: { id } });
  toast.success("OTP sent to customer email");
  setSelectedOrder(id);
  setOtpArray(["", "", "", "", "", ""]);

  
  setTimeout(() => {
    document.getElementById("otp-0")?.focus();
  }, 100);
};
 const handleVerify = async () => {
  const otp = otpArray.join("");

  try {
    await verifyOTP({
      variables: {
        id: selectedOrder,
        otp,
      },
    });

    toast.success("Delivery completed");
    refetchMy();
    setSelectedOrder(null);
    setOtpArray(["", "", "", "", "", ""]);
  } catch (err: any) {
    toast.error(err.message || "Invalid OTP");
  }
};
  const handleOtpChange = (value: string, index: number) => {
  if (!/^[0-9]?$/.test(value)) return;

  const newOtp = [...otpArray];
  newOtp[index] = value;
  setOtpArray(newOtp);

  
  if (value && index < 5) {
    const next = document.getElementById(`otp-${index + 1}`);
    next?.focus();
  }
};

const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  if (e.key === "Backspace" && !otpArray[index] && index > 0) {
    const prev = document.getElementById(`otp-${index - 1}`);
    prev?.focus();
  }
};
  return (
    <div className="bg-[#FFF8F1] min-h-screen">

      <div className="w-full flex items-center justify-between px-6 py-3 bg-white border-b sticky top-0 backdrop-blur-md z-100">


        <div className="flex items-center gap-3">
          <h1 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">SwiftDrop</h1>

          <div className="bg-yellow-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium outline outline-amber-300">
            Rider
          </div>
        </div>

        <div className='flex gap-4'>

          <LogOut></LogOut>
        </div>
      </div>
      <div className='px-30 mt-6'>
        <h1>Welcome, {userName}</h1>
      </div>


      <div className="px-30 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">


        <div className="group relative bg-white p-6 rounded-xl shadow-sm border cursor-pointer overflow-hidden">
          <DollarSign className="text-orange-500" />
          <p className="text-gray-500 text-sm">Revenue</p>
          <h2 className="text-2xl font-bold text-black mt-2">₦{completedOrders.length * 1500}</h2>
          <p className="text-green-500 text-sm mt-1"></p>

          <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>
        </div>


        <div className="group relative bg-white p-6 rounded-xl shadow-sm border cursor-pointer overflow-hidden">

          <Bike className="text-green-500" />
          <p className="text-gray-500 text-sm">Active</p>
          <h2 className="text-2xl font-bold text-black mt-2">{myOrders.length}</h2>
          <p className="text-green-500 text-sm mt-1"></p>
          <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>

        </div>


        <div className="group relative bg-white p-6 rounded-xl shadow-sm border cursor-pointer overflow-hidden">

          <Clock className="text-blue-500" />

          <p className="text-gray-500 text-sm">Available</p>
          <h2 className="text-2xl font-bold text-black mt-2">{availableOrders.length}</h2>
          <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>

        </div>


        <div className="group relative bg-white p-6 rounded-xl shadow-sm border cursor-pointer overflow-hidden">

          <CircleCheckBig className="text-yellow-500" />

          <p className="text-gray-500 text-sm">Completed</p>
          <h2 className="text-2xl font-bold text-black mt-2">{completedOrders.length}</h2>
          <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>

        </div>

      </div>




      <div className="px-30 mt-8 grid md:grid-cols-2 gap-8">

        {/* AVAILABLE */}
        <div>
          <h2 className="font-semibold mb-4 text-gray-800 text-lg">
            Available Deliveries
          </h2>

          {availableOrders.length === 0 ? (
            <div className="bg-white border border-dashed p-10 rounded-2xl text-center text-gray-400">
              No available orders
            </div>
          ) : (
            <div className="space-y-4">
              {availableOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-2xl border hover:shadow-lg transition"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-gray-900 text-sm">
                      Order: {order.id.slice(-6)}
                    </p>

                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                      Available
                    </span>
                  </div>

                  {/* ITEMS */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-semibold text-gray-900">x{item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* INFO */}
                  <div className="mt-3 space-y-1">
                    <p className="text-orange-600 font-bold text-lg">
                      ₦{order.total}
                    </p>

                    <p className="text-sm text-gray-500 truncate">
                      {order.deliveryAddress}
                    </p>
                  </div>

                  {/* ACTION */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAccept(order.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-medium"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => handleReject(order.id)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CURRENT */}
        <div>
          <h2 className="font-semibold mb-4 text-gray-800 text-lg">
            Active Deliveries
          </h2>

          {myOrders.length === 0 ? (
            <div className="bg-white border border-dashed p-10 rounded-2xl text-center text-gray-400">
              No active deliveries
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-2xl border hover:shadow-lg transition"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-gray-900 text-sm">
                      Order #{order.id.slice(-6)}
                    </p>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium
                  ${order.status === "accepted" && "bg-blue-100 text-blue-600"}
                  ${order.status === "in_transit" && "bg-orange-100 text-orange-600"}
                `}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* ITEMS */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-semibold">x{item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* INFO */}
                  <div className="mt-3 space-y-1">
                    <p className="text-orange-600 font-bold text-lg">
                      ₦{order.total}
                    </p>

                    <p className="text-sm text-gray-500 truncate">
                      {order.deliveryAddress}
                    </p>
                  </div>

                  {/* ACTION */}
                  {order.status === "accepted" && (
                    <button
                      onClick={() =>
                        updateStatus({
                          variables: { id: order.id, status: "in_transit" },
                        })
                      }
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium"
                    >
                      Start Delivery
                    </button>
                  )}

                  {order.status === "in_transit" && (
                    <>
                      <button
                        onClick={() => handleSendOTP(order.id)}
                        className="mt-4 w-full bg-orange-500 text-white py-2 rounded-xl"
                      >
                        Mark Delivered
                      </button>

                     
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      <div className="px-30 mt-12">
        <h2 className="font-semibold mb-4 text-gray-800 text-lg">
          Delivery History
        </h2>

        {completedOrders.length === 0 ? (
          <div className="bg-white border border-dashed p-10 rounded-2xl text-center text-gray-400">
            No completed deliveries yet
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {completedOrders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border hover:shadow-lg transition"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold text-sm">
                    Order: {order.id.slice(-6)}
                  </p>

                  <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                    Delivered
                  </span>
                </div>

                {/* ITEMS */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-semibold">x{item.qty}</span>
                    </div>
                  ))}
                </div>

                {/* INFO */}
                <div className="mt-3">
                  <p className="text-orange-600 font-bold text-lg">
                    ₦{order.total}
                  </p>

                  <p className="text-sm text-gray-500 truncate">
                    {order.deliveryAddress}
                  </p>

                  <p className="text-green-600 font-semibold mt-2 text-sm">
                    +₦1500 earned
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>










{selectedOrder && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">

    {/* Modal */}
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-scaleIn">

      {/* Top Icon */}
      <div className="flex justify-center">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-100">
          <CircleCheckBig className="text-orange-500 w-7 h-7" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-center text-gray-800 mt-4">
        Confirm Delivery
      </h2>

      <p className="text-sm text-gray-500 text-center mt-1">
        Ask customer for the OTP to complete delivery
      </p>

      {/* Divider */}
      <div className="my-5 border-t" />

      {/* OTP */}
      <div className="flex justify-between gap-2">
        {otpArray.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="
              w-12 h-14 
              text-center text-xl font-bold 
              rounded-xl border 
              focus:outline-none 
              focus:ring-2 focus:ring-orange-400 
              focus:border-orange-400
              transition-all
              shadow-sm
            "
          />
        ))}
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 text-center mt-3">
        OTP expires in 5 minutes
      </p>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => {
            setSelectedOrder(null);
            setOtpArray(["", "", "", "", "", ""]);
          }}
          className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
        >
          Cancel
        </button>

        <button
          onClick={handleVerify}
          disabled={otpArray.includes("")}
          className={`
            flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition
            ${
              otpArray.includes("")
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }
          `}
        >
          Confirm
        </button>
      </div>

    </div>
  </div>
)}


    </div>
    
  );
}