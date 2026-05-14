"use client"
import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { BiUser, BiEnvelope, BiLock, BiShow, BiHide, BiStore, BiCar } from "react-icons/bi"
import { signupSchema, signupFormData } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react'
import toast from 'react-hot-toast';
import { ChevronDown } from "lucide-react";
import ParticlesBackground from '@/components/particleBg';



const CREATEUSER = gql`
  mutation Createuser($input: UserInput!) {
  createuser(input: $input) {
    id
    name
    email
    role
    phone
    businessName
    businessAddress
    businessType
    vehicleType
    vehicleNumber
    createdAt
  }
}
`;

const Signup = () => {

  const businessOptions = [
    { value: "", label: "Select business type" },
    { value: "Restaurant", label: " Restaurant" },
    { value: "Grocery", label: " Grocery" },
    { value: "Fashion", label: " Fashion" },
    { value: "Electronics", label: " Electronics" },
    { value: "Other", label: " Other" },
  ];


  const vehicleOptions = [
    { value: "", label: "Select vehicle type" },
    { value: "Motorcycle", label: " Motorcycle" },
    { value: "Bicycle", label: " Bicycle" },
    { value: "Car", label: " Car" },
  ];
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("customer")
  const [open, setOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);


  const router = useRouter();


  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<signupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "customer" }
  })
  const selected = businessOptions.find(
    (o) => o.value === watch("businessType")
  );
  const [createUser, { loading }] = useMutation(CREATEUSER, {
    onCompleted: () => {
      toast.success("Account created successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 1500)
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data: signupFormData) => {
    createUser({ variables: { input: data } });
  }

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (storedRole === "vendor" || storedRole === "rider") {
      setRole(storedRole);
      setValue("role", storedRole);
    }
    sessionStorage.removeItem("role");
  }, [setValue]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">




      <div className="relative z-10 flex items-center flex-col gap-4 justify-center min-h-screen p-4">
        <ParticlesBackground />
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md 
bg-white/10 backdrop-blur-xl 
border border-orange-300
p-8 rounded-2xl 

space-y-4">
          <h1 className="text-orange-500 text-2xl md:text-3xl font-semibold text-center">SwiftDrop</h1>
          <h3 className="text-2xl font-semibold text-center">Create Account</h3>
          <p className="text-gray-400 text-center">Join our multi-vendor delivery platform</p>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Account Type
            </label>

            <div className="grid grid-cols-3 gap-2">

              {/* Customer */}
              <button
                type="button"
                onClick={() => {
                  setRole("customer");
                  setValue("role", "customer");
                }}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${role === "customer"
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                  }`}
              >
                Customer
              </button>

              {/* Vendor */}
              <button
                type="button"
                onClick={() => {
                  setRole("vendor");
                  setValue("role", "vendor");
                }}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${role === "vendor"
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                  }`}
              >
                Vendor
              </button>

              {/* Rider */}
              <button
                type="button"
                onClick={() => {
                  setRole("rider");
                  setValue("role", "rider");
                }}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${role === "rider"
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                  }`}
              >
                Rider
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-700">Full Name</label>
              <div className="relative">
                <BiUser className="absolute left-3 top-3 text-gray-400" />
                <input {...register("name")} type="text" placeholder="Name" className="w-full pl-10 pr-3 py-2 border rounded-md" />
                <p className="text-red-500 text-[10px] mt-1 min-h-[1.25rem]">{errors.name?.message}</p>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Phone</label>
              <input {...register("phone")} type="text" placeholder="091.." className="w-full px-3 py-2 border rounded-md" />
              <p className="text-red-500 text-[10px]">{errors.phone?.message}</p>
            </div>
          </div>
          

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-700">Email</label>
              <div className="relative">
                <BiEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input {...register("email")} type="email" placeholder="Email" className="w-full pl-10 pr-3 py-2 border rounded-md" />
                <p className="text-red-500 text-[10px]">{errors.email?.message}</p>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Password</label>
              <div className="relative">
                <BiLock className="absolute left-3 top-3 text-gray-400" />
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-10 pr-10 py-2 border rounded-md" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? <BiHide /> : <BiShow />}</button>
                <p className="text-red-500 text-[10px]">{errors.password?.message}</p>
              </div>
            </div>
          </div>



          {role === "vendor" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-700">Business Name</label>
                  <input {...register("businessName")} type="text" placeholder="My Business" className="w-full px-3 py-2 border rounded-md" />
                  <p className="text-red-500 text-[10px]">{errors.businessName?.message}</p>
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Business Address</label>
                  <input {...register("businessAddress")} type="text" placeholder="123 Street" className="w-full px-3 py-2 border rounded-md" />
                  <p className="text-red-500 text-[10px]">{errors.businessAddress?.message}</p>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Business Type
                </label>

                <div className="relative">

                  {/* BUTTON */}
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="
        w-full flex items-center justify-between
        px-4 py-3
        rounded-2xl
        border border-gray-200
        bg-white
        text-sm font-medium text-gray-700
        shadow-sm
        hover:border-orange-300 hover:shadow-md
        transition-all
      "
                  >
                    <span>
                      {selected?.label || "Select business type"}
                    </span>

                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* DROPDOWN */}
                  {open && (
                    <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                      {businessOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setValue("businessType", opt.value);
                            setOpen(false);
                          }}
                          className={`
              px-4 py-3 text-sm cursor-pointer transition-all
              hover:bg-orange-50
              ${watch("businessType") === opt.value
                              ? "bg-orange-100 text-orange-600 font-semibold"
                              : "text-gray-700"
                            }
            `}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="mt-1 text-[11px] text-red-500">
                  {errors.businessType?.message}
                </p>
              </div>
            </>
          )}

          {role === "rider" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Vehicle Type
                </label>

                <div className="relative">

                  {/* BUTTON */}
                  <button
                    type="button"
                    onClick={() => setVehicleOpen(!vehicleOpen)}
                    className="
        w-full flex items-center justify-between
        px-4 py-3
        rounded-2xl
        border border-gray-200
        bg-white
        text-sm font-medium text-gray-700
        shadow-sm
        hover:border-orange-300 hover:shadow-md
        transition-all
      "
                  >
                    <span>
                      {vehicleOptions.find((v) => v.value === watch("vehicleType"))?.label ||
                        "Select vehicle type"}
                    </span>

                    <span className="text-gray-400">⌄</span>
                  </button>

                  {/* DROPDOWN (opens UPWARD) */}
                  {vehicleOpen && (
                    <div className="
        absolute bottom-full mb-2 w-full
        bg-white border border-gray-100
        rounded-2xl shadow-xl z-50 overflow-hidden
      ">
                      {vehicleOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setValue("vehicleType", opt.value);
                            setVehicleOpen(false);
                          }}
                          className={`
              px-4 py-3 text-sm cursor-pointer transition-all
              hover:bg-orange-50
              ${watch("vehicleType") === opt.value
                              ? "bg-orange-100 text-orange-600 font-semibold"
                              : "text-gray-700"
                            }
            `}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="mt-1 text-[10px] text-red-500">
                  {errors.vehicleType?.message}
                </p>
              </div>
              <div>
                <label className="block mb-1 text-gray-700">Vehicle Number</label>
                <input {...register("vehicleNumber")} type="text" placeholder="ABC-123" className="w-full px-3 py-2 border rounded-md" />
                <p className="text-red-500 text-[10px]">{errors.vehicleNumber?.message}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 text-sm">
            <span>Already have an account?</span>
            <Link href="/login" className="text-orange-500">Sign In</Link>
          </div>

          <button

            className="w-full bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 text-white py-3 rounded-md hover:shadow-lg disabled:opacity-50"
            type="submit"
            disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Signup