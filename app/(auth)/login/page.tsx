"use client"
import React, { useState } from 'react'
import { BiEnvelope, BiLock, BiShow, BiHide } from "react-icons/bi";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, loginFormData } from '@/lib/validation';
import { gql } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import ParticlesBackground from '@/components/particleBg';

const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {

        name
        email
        role
        businessType

      }
    }
  }
`;
type LoginResponse = {
  login: {
    token: string;
    user: {
      name: string;
      email: string;
      role: string;
      businessType: String


    }
  }
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<loginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const [loginUser, { loading }] = useMutation<LoginResponse>(LOGIN_USER, {
    onCompleted: (data) => {
      toast.success(`Login Successful`);
      const { user } = data.login;


      switch (user.role) {
        case "vendor":
          router.push("/vendor");
          break;
        case "rider":
          router.push("/rider");
          break;
        case "customer":
          router.push("/customer");
          break;
        case "admin":
          router.push("/admin");
          break;
        default:
          router.push("/");
      }


    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const onSubmit = (data: loginFormData) => {
    loginUser({ variables: { email: data.email, password: data.password } });
  }

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
          <h3 className="text-2xl text-black font-semibold mb-2 text-center">Welcome back</h3>
          <p className="text-1xl text-gray-400 mb-3 text-center">Sign in to manage your account</p>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <div className="relative">
              <BiEnvelope className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-black `}
              />
              <p className="text-red-500 text-[10px]">{errors.email?.message}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <div className="relative">
              <BiLock className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-black `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <BiHide size={20} /> : <BiShow size={20} />}
              </button>
              <p className="text-red-500 text-[10px]">{errors.password?.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <h1 className="text-[13px]">Don't have an account?</h1>
            <Link className="text-[13px] text-orange-500" href='/signup'>Create Account</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 hover:shadow-lg text-white py-3 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login