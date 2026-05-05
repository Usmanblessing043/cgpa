"use client"
import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { BiUser, BiEnvelope, BiLock, BiShow, BiHide } from "react-icons/bi"
import { signupSchema, signupFormData } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import { gql} from '@apollo/client';
import { useMutation } from '@apollo/client/react'
import toast from 'react-hot-toast';


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
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("customer")
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<signupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "customer" }
  })

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
    <div className='bg-gray-100'>
      <div className="flex items-center flex-col gap-4 justify-center min-h-screen bg-white p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl outline outline-gray-200 space-y-4">
          <h1 className="text-orange-500 text-2xl md:text-3xl font-semibold text-center">SwiftDrop</h1>
          <h3 className="text-2xl font-semibold text-center">Create Account</h3>
          <p className="text-gray-400 text-center">Join our multi-vendor delivery platform</p>

          <div>
            <label className="block mb-1 text-gray-700">Account Type</label>
            <select {...register("role")} onChange={(e) => setRole(e.target.value)} className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="rider">Rider</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-700">Full Name</label>
              <div className="relative">
                <BiUser className="absolute left-3 top-3 text-gray-400" />
                <input {...register("name")} type="text" placeholder="John Doe" className="w-full pl-10 pr-3 py-2 border rounded-md" />
                <p className="text-red-500 text-sm mt-1 min-h-[1.25rem]">{errors.name?.message}</p>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Phone</label>
              <input {...register("phone")} type="text" placeholder="+234..." className="w-full px-3 py-2 border rounded-md" />
              <p className="text-red-500 text-sm">{errors.phone?.message}</p>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Email</label>
            <div className="relative">
              <BiEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input {...register("email")} type="email" placeholder="you@example.com" className="w-full pl-10 pr-3 py-2 border rounded-md" />
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Password</label>
            <div className="relative">
              <BiLock className="absolute left-3 top-3 text-gray-400" />
              <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-10 pr-10 py-2 border rounded-md" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? <BiHide /> : <BiShow />}</button>
              <p className="text-red-500 text-sm">{errors.password?.message}</p>
            </div>
          </div>

          {role === "vendor" && (
            <>
              <div>
                <label className="block mb-1 text-gray-700">Business Name</label>
                <input {...register("businessName")} type="text" placeholder="My Business" className="w-full px-3 py-2 border rounded-md" />
                <p className="text-red-500 text-sm">{errors.businessName?.message}</p>
              </div>
              <div>
                <label className="block mb-1 text-gray-700">Business Address</label>
                <input {...register("businessAddress")} type="text" placeholder="123 Street" className="w-full px-3 py-2 border rounded-md" />
                <p className="text-red-500 text-sm">{errors.businessAddress?.message}</p>
              </div>
              <div>
                <label className="block mb-1 text-gray-700">Business Type</label>
                <select {...register("businessType")} className="w-full px-3 py-2 border rounded-md">
                  <option>Restaurant</option>
                  <option>Grocery</option>
                  <option>Fashion</option>
                  <option>Electronics</option>
                  <option>Other</option>
                </select>
              </div>
            </>
          )}

          {role === "rider" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-gray-700">Vehicle Type</label>
                <select {...register("vehicleType")} className="w-full px-3 py-2 border rounded-md">
                  <option>Motorcycle</option>
                  <option>Bicycle</option>
                  <option>Car</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-700">Vehicle Number</label>
                <input {...register("vehicleNumber")} type="text" placeholder="ABC-123" className="w-full px-3 py-2 border rounded-md" />
                <p className="text-red-500 text-sm">{errors.vehicleNumber?.message}</p>
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