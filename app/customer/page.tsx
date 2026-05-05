"use client"
import React from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react';
import { useState, useEffect } from 'react';
import { Box, Utensils, ShoppingCart, Shirt, Laptop, Store, MapPin, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { TailSpin } from "react-loader-spinner";



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

const GET_VENDORS = gql`
  query {
    vendors {
      id
      businessName
      businessType
      businessAddress
    }
  }
`;
type Vendor = {
  id: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
};

type VendorResponse = {
  vendors: Vendor[];
};

const page = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [search, setSearch] = useState("");
  const categories = [
    { name: "All", icon: Box },
    { name: "Restaurant", icon: Utensils },
    { name: "Grocery", icon: ShoppingCart },
    { name: "Fashion", icon: Shirt },
    { name: "Electronics", icon: Laptop },
    { name: "Other", icon: Store },
  ];

  const [active, setActive] = useState("All");

  const { data, error } = useQuery<MeResponse>(ME);
  const { data: vendorData, loading } = useQuery<VendorResponse>(GET_VENDORS);
  useEffect(() => {
    if (data?.me?.name) {
      setUserName(data.me.name.toUpperCase());
    }
  }, [data]);
  const filteredVendors =
    vendorData?.vendors
      ?.filter((v) => {
        const matchesCategory =
          active === "All"
            ? true
            : v.businessType?.toLowerCase() === active.toLowerCase();

        const matchesSearch =
          v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
          v.businessType?.toLowerCase().includes(search.toLowerCase()) ||
          v.businessAddress?.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
      });

  const getCategoryImage = (type: string) => {
    switch (type?.toLowerCase()) {
      case "restaurant":
        return "https://images.unsplash.com/photo-1504674900247-0877df9cc836";

      case "grocery":
        return "https://images.unsplash.com/photo-1542838132-92c53300491e";

      case "fashion":
        return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d";

      case "electronics":
        return "https://images.unsplash.com/photo-1518770660439-4636190af475";

      default:
        return "https://images.unsplash.com/photo-1441986300917-64674bd600d8";
    }
  };
  function gotoorder(params: any) {
    router.push('/customer/order')

  }
  return (
    <div className='bg-[#FFF8F1]  min-h-screen '>
      <div className="w-full flex items-center justify-between px-6 py-3 bg-white border-b sticky top-0 backdrop-blur-md z-100">


        <div className="flex items-center gap-3">
          <h1 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">SwiftDrop</h1>

          <div className="bg-yellow-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium outline outline-amber-300">
            Customer
          </div>
        </div>

        <div className='flex gap-4 items-center'>
          <button
            onClick={gotoorder}
            className="px-4 py-2 text-sm font-medium text-white  rounded-lg  bg-black"
          >
            My Orders
          </button>
          <div> <LogOut></LogOut></div>
        </div>
      </div>

      <div className="px-6 mt-6 flex justify-center">
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 md:p-10 text-white w-full ">


          <p className="text-sm opacity-90 text-black">Welcome {userName}</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">
            What would you like to order?
          </h1>


          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-md">

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendors, categories..."
                className="w-full px-4 py-3 pl-10 rounded-xl bg-white text-black outline-none"
              />


              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

            </div>
          </div>

        </div>
      </div>

      <div className="flex gap-3 flex-wrap my-3 mx-6">
        {categories.map((cat) => {
          const Icon = cat.icon;

          return (
            <button
              key={cat.name}
              onClick={() => setActive(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition duration-300
          ${active === cat.name
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-orange-500 hover:text-white hover:border-orange-500"
                }
        `}
            >
              <Icon size={16} />
              {cat.name}
            </button>
          );
        })}
      </div>


      <div className="px-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 text-black">
          Vendors Near You
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <TailSpin height="50" width="50" color="#f97316" />
          </div>
        ) : filteredVendors?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-3"></div>

            <h3 className="text-lg font-semibold text-gray-700">
              No vendors found
            </h3>

            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              We couldn’t find anything matching your search or category filter.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setActive("All");
              }}
              className="mt-4 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVendors?.map((vendor: any) => (
              <div
                key={vendor.id}
                onClick={() => router.push(`/customer/vendor/${vendor.id}`)}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
              >

                <div className="h-32 relative rounded-t-2xl overflow-hidden group">

                  {/* BACKGROUND IMAGE */}
                  <img
                    src={getCategoryImage(vendor.businessType)}
                    alt="vendor"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-white/90 text-xs px-2 py-1 rounded-md">
                    {vendor.businessType}
                  </span>

                  {/* DARK OVERLAY (important for readability) */}
                  <div className="absolute inset-0 bg-black/30"></div>

                  {/* CONTENT */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md group-hover:scale-110 transition">
                      <span className="text-2xl font-bold text-orange-500">
                        {vendor.businessName?.[0].toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* HOVER SHINE */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                </div>


                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900  transition-colors truncate">
                      {vendor.businessName.toUpperCase()}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {vendor.businessType}
                    </p>
                  </div>


                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                    <span className="line-clamp-2">
                      {vendor.businessAddress || "Location not set"}
                    </span>
                  </div>


                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-medium">
                      Open Store
                    </span>

                    <span className="text-xs text-gray-400 group-hover:text-orange-500 transition">
                      View
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



    </div>
  )
}

export default page