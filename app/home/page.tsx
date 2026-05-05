"use client"
import React from 'react'
import Image from 'next/image'
import { ImageWithFallback } from '@/components/imagewithfallback';
import { Package, Truck, Users, Clock, ShieldCheck, Bell, ChevronRight, Star, CheckCircle2 } from 'lucide-react';
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";


const home = () => {
    const router = useRouter();

    const steps = [
        {
            number: '01',
            title: 'Choose Your Vendor',
            description: 'Browse from hundreds of local restaurants, stores, and vendors in your area',
        },
        {
            number: '02',
            title: 'Place Your Order',
            description: 'Select items, customize your order, and checkout securely in minutes',
        },
        {
            number: '03',
            title: 'Track in Real-Time',
            description: 'Watch your order being prepared, picked up, and delivered to your door',
        },
        {
            number: '04',
            title: 'Enjoy Your Delivery',
            description: 'Receive your order fresh and on time, every time every everyday',
        },
    ];
    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Regular Customer',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            rating: 5,
            text: 'SwiftDrop has made my life so much easier! I can order from my favorite restaurants and track everything.',
        },
        {
            name: 'Michael Chen',
            role: 'Vendor Owner',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            rating: 5,
            text: 'As a restaurant owner, SwiftDrop has helped us reach more customers and grow our business significantly.',
        },
        {
            name: 'David Okafor',
            role: 'Delivery Rider',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
            rating: 5,
            text: 'The rider app is intuitive and I love the flexibility. I can earn good money while setting my own schedule.',
        },
    ];

  
    const features = [
        {
            icon: <Package className="w-6 h-6 text-white" />,
            title: 'Easy Ordering',
            description: 'Browse vendors and place orders in seconds',
        },
        {
            icon: <Bell className="w-6 h-6 text-white" />,
            title: 'Live Tracking',
            description: 'Track your delivery in real time',
        },
        {
            icon: <Truck className="w-6 h-6 text-white" />,
            title: 'Fast Delivery',
            description: 'Riders pick up and deliver quickly',
        },
        {
            icon: <Users className="w-6 h-6 text-white" />,
            title: 'Multi-Vendors',
            description: 'Hundreds of vendors at your fingertips',
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-white" />,
            title: 'Secure Payment',
            description: 'Safe and reliable payment processing',
        },
        {
            icon: <Clock className="w-6 h-6 text-white" />,
            title: 'Real-time Updates',
            description: 'Stay informed at every step',
        },
    ];
     const goLogin = () => router.push("/login");
 const goSignup = (role: string) => {
  router.push("/signup");
  sessionStorage.setItem("role", role); 
};

    return (
        <div className='bg-gray-100  min-h-screen '>
            <div className="flex h-16 md:h-20 justify-between items-center px-4 md:px-10 bg-white/85 border-b border-gray-300 sticky top-0 backdrop-blur-md z-50">

                <div className="text-orange-500 text-2xl md:text-3xl font-semibold">
                    SwiftDrop
                </div>

                <div className="flex gap-2 md:gap-5">
                    <button
                    onClick={goLogin}
                     className="px-3 md:px-5 py-2 rounded-lg text-sm md:text-base  hover:text-white hover:bg-black hover:shadow-lg outline outline-gray-300">
                        Sign In
                    </button>

                    <button 
                    onClick={() => goSignup("customer")}
                    className="px-3 md:px-5 py-2 rounded-lg text-sm md:text-base bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 text-white hover:shadow-lg">
                        Get Started
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6 md:gap-8 items-center justify-center min-h-[500px] md:h-[600px] px-4 text-center border-b border-gray-300 bg-[linear-gradient(rgba(255,255,255,0.7),rgba(255,255,255,0.7)),url('/logistic.png')]  bg-cover bg-center bg-no-repeat">


                <div className="text-orange-500 bg-amber-50 px-4 md:px-8 py-1 rounded-xl text-sm md:text-base">
                    Multi-Vendor Delivery Platform
                </div>

                <div className="text-2xl sm:text-3xl md:text-5xl font-semibold max-w-xs sm:max-w-lg md:max-w-2xl">
                    Deliver{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400">
                        anything
                    </span>
                    , anywhere, anytime
                </div>


                <p className="text-gray-800 text-sm md:text-base  max-w-xs sm:max-w-lg md:max-w-xl">
                    Connect customers with local vendors and riders for fast, reliable delivery.
                    Order food, groceries packages and more.
                </p>


                <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full sm:w-auto">

                    <button 
                    onClick={() => goSignup("customer")}
                    className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400  text-white hover:shadow-lg">
                        Start Ordering
                    </button>

                    <button 
                    onClick={() => goSignup("vendor")}
                    className="w-full sm:w-auto px-5 py-2 rounded-lg  bg-white outline outline-gray-300 hover:shadow-lg">
                        Become a vendor
                    </button>

                </div>

            </div>
            <div className="flex flex-col justify-center items-center py-16 gap-8 border-b-1 border-gray-300 bg-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-3">Everything you need</h1>
                    <p className="text-gray-500 text-lg">
                        All the tools and features to make your delivery experience seamless
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-6 max-w-6xl">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}

                            className="w-full max-w-[350px] bg-white border border-gray-200 rounded-lg px-6 py-9 hover:shadow-xl hover:translate-y-[-5px] transition-all duration-300"
                        >
                            <div className="bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                                {feature.icon}
                            </div>
                            <h1 className="text-[20px] font-semibold mb-2">{feature.title}</h1>
                            <h2 className="text-[15px] text-gray-500">{feature.description}</h2>
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-3">How it works</h2>
                        <p className="text-gray-500 text-lg">
                            Getting your order delivered is simple and fast
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                key={index} className="relative">
                                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300">
                                    <div className="text-6xl font-bold text-orange-400 mb-4">{step.number}</div>
                                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                    <p className="text-gray-500">{step.description}</p>
                                </div>

                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-3">Built for everyone</h2>
                        <p className="text-gray-500 text-lg">
                            Customers, vendors, and riders - we've got you covered
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* For Customers */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1752070182361-9fa562ed7f97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                alt="Happy customer receiving delivery"
                                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-white text-3xl font-bold mb-2">For Customers</h3>
                                <p className="text-white/90 mb-4">
                                    Order from your favorite vendors and track deliveries in real-time
                                </p>
                                <button
                                 onClick={() => goSignup("customer")}
                                    className="self-start px-6 py-2 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium"
                                >
                                    Start Ordering
                                </button>
                            </div>
                        </div>

                        {/* For Vendors */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1683710806810-02a3bb540718?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                alt="Restaurant kitchen food preparation"
                                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-white text-3xl font-bold mb-2">For Vendors</h3>
                                <p className="text-white/90 mb-4">
                                    Grow your business and reach more customers with our platform
                                </p>
                                <button
                                    onClick={() => goSignup("vendor")}

                                    className="self-start px-6 py-2 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium"
                                >
                                    Join as Vendor
                                </button>
                            </div>
                        </div>

                        
                        <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1766170507518-e7a6ca397e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                alt="Delivery driver on motorcycle"
                                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-white text-3xl font-bold mb-2">For Riders</h3>
                                <p className="text-white/90 mb-4">
                                    Earn money on your schedule by delivering orders in your area
                                </p>
                                <button
                                onClick={() => goSignup("rider")}
                                    className="self-start px-6 py-2 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium"
                                >
                                    Become a Rider
                                </button>
                            </div>
                        </div>

                        
                        <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1634785059779-4f87d95cff28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                                alt="Smartphone app delivery tracking"
                                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-white text-3xl font-bold mb-2">Track Everything</h3>
                                <p className="text-white/90 mb-4">
                                    Stay updated with real-time notifications and live tracking
                                </p>
                                <button
                                    className="self-start px-6 py-2 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium"
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-3">What people are saying</h2>
                        <p className="text-gray-500 text-lg">
                            Join thousands of satisfied customers, vendors, and riders
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-orange-400 text-orange-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">&ldquo;{testimonial.text}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <ImageWithFallback
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-semibold">{testimonial.name}</div>
                                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>



            <div className="py-20 bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
                    <p className="text-orange-100 text-lg mb-8">
                        Join SwiftDrop today and experience the future of delivery
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button

                            className="px-3 py-3 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold text-lg shadow-lg"
                        >
                            Sign Up Now
                        </button>
                        <button

                            className="px-5 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-orange-600 transition-all duration-300 font-semibold text-lg"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 text-white py-12">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="text-orange-500 text-2xl font-bold mb-4">SwiftDrop</div>
                            <p className="text-gray-400">
                                Delivering anything, anywhere, anytime with speed and reliability.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        Press
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        Safety
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Get Started</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        For Customers
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        For Vendors
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-orange-400 transition-colors">
                                        For Riders
                                    </a>
                                </li>

                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                        <p> 2026 SwiftDrop. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default home