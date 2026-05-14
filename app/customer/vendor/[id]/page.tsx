"use client";
import { useParams } from "next/navigation";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react"
import { useState } from "react";
import { ShoppingCart, ShoppingBag, LogOut, Menu, X } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";
 
const GET_VENDOR_POSTS = gql`
  query ($vendorId: ID!) {
    vendorPosts(vendorId: $vendorId) {
      id
      name
      price
      image
    }
  }
`;
const GET_VENDOR_DATA = gql`
  query ($vendorId: ID!) {
    vendor(id: $vendorId) {
      businessName
      businessAddress
    }
    vendorPosts(vendorId: $vendorId) {
      id
      name
      price
      image
    }
  }
`;
const UPDATE_CART = gql`
  mutation ($cart: [CartItemInput]!) {
    updateCart(cart: $cart) {
      id
    }
  }
`;
const GET_ME = gql`
  query {
    me {
      cart {
        productId
        name
        price
        qty
        image
      }
    }
  }
`;

const CREATE_ORDER = gql`
  mutation (
    $items: [CartItemInput!]!
    $total: Float!
    $deliveryAddress: String!
    $vendorId: ID!
  ) {
    createOrder(
      items: $items
      total: $total
      deliveryAddress: $deliveryAddress
      vendorId: $vendorId
    ) {
      id
      status
    }
  }
`;
type Post = {
    id: string;
    name: string;
    price: number;
    image: string;
};

type VendorPostsResponse = {
    vendorPosts: Post[];
};
type VendorPostsResponses = {
    vendorPosts: Post[];
    vendor: {
        businessName: string;
        businessAddress: string;
    };
};
type MeResponse = {
    me: {
        cart: {
            productId: string;
            name: string;
            price: number;
            qty: number;
            image: string;
        }[];
    };
};
export default function VendorPage() {
    const { id } = useParams();
    const router = useRouter()
    const [cart, setCart] = useState<any[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [search, setSearch] = useState("");
    const [loadedFromServer, setLoadedFromServer] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryFee, setDeliveryFee] = useState(1500);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [createOrder] = useMutation(CREATE_ORDER);
    const { data, loading } = useQuery<VendorPostsResponse>(GET_VENDOR_POSTS, {
        variables: { vendorId: id },
    });
    const { data: datas, loading: loadd } = useQuery<VendorPostsResponses>(GET_VENDOR_DATA, {
        variables: { vendorId: id },
    });
    const [updateCartMutation] = useMutation(UPDATE_CART);

    const { data: userData, refetch, error: errros } = useQuery<MeResponse>(GET_ME, {
        fetchPolicy: "network-only", skip: typeof window === "undefined"
    });


    const addToCart = (product: any) => {
        const currentVendorId = cart[0]?.vendorId;


        if (cart.length > 0 && currentVendorId !== id) {
            toast.error("You can only order from one vendor at a time");
            return;
        }

        setCart((prev) => {
            const exists = prev.find((p) => p.id === product.id);

            if (exists) {
                return prev.map((p) =>
                    p.id === product.id
                        ? { ...p, qty: p.qty + 1 }
                        : p
                );
            }

            return [
                ...prev,
                {
                    ...product,
                    qty: 1,
                    vendorId: id,
                },
            ];
        });
    };
    const updateQty = (id: string, amount: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === id
                        ? { ...item, qty: item.qty + amount }
                        : item
                )
                .filter((item) => item.qty > 0)
        );
    };
    const filteredProducts = data?.vendorPosts?.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );


    useEffect(() => {
        if (!userData?.me?.cart) return;

        setCart(
            userData.me.cart.map((item) => ({
                id: item.productId,
                name: item.name,
                price: item.price,
                qty: item.qty,
                image: item.image,

            }))
        );

        setLoadedFromServer(true);
    }, [userData?.me?.cart]);

    const subtotal = cart.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );

    const total = subtotal + deliveryFee;

    useEffect(() => {
        if (!loadedFromServer) return;

        updateCartMutation({
            variables: {
                cart: cart.map((item) => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty,
                    image: item.image,
                })),
            },
        });
    }, [cart]);


    useEffect(() => {
        console.log("USER DATA:", userData);
    }, [userData]);
    console.log("RENDER userData:", userData);
    console.log("RENDER cart:", cart);

    useEffect(() => {
        if (errros) {
            console.log(" GET_ME ERROR:", errros);

        }
    }, [errros]);
    const clearCart = () => {
        setCart([]);
    };





    const payWithPaystack = async () => {
        if (!deliveryAddress.trim()) {
            toast.error("Please enter delivery address");
            return;
        }

        if (typeof window === "undefined") return;

       // @ts-ignore
        const PaystackPop = (await import("@paystack/inline-js")) as any;

        const paystack = new PaystackPop();

        paystack.newTransaction({
           key: process.env.NEXT_PUBLIC_PAYSTACK_KEY!,
            email: "usmanblessing043@email.com",
            amount: total * 100,
            currency: "NGN",

            metadata: {
                cart,
                deliveryAddress,
            },


            onSuccess: async (transaction: any) => {
                try {
                    await createOrder({
                        variables: {
                            items: cart.map((item) => ({
                                productId: item.id,
                                name: item.name,
                                price: item.price,
                                qty: item.qty,
                                image: item.image,
                            })),
                            total,
                            deliveryAddress,
                            vendorId: id,
                        },
                    });

                    toast.success("Order placed successfully ");

                    setCart([]);
                    setShowCart(false);
                    router.push('/customer/order')
                } catch (err: any) {
                    toast.error(err.message);
                }
            },
            onCancel: () => {
                console.log("Cancelled");
            },
        });
    };
    function gotodashboard(params: any) {
        router.push('/customer')

    }
    function gotoorder(params: any) {
        router.push('/customer/order')

    }
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

                {/* LEFT */}
                <div className="flex items-center gap-2 md:gap-3">
                    <h1 className="text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">
                        SwiftDrop
                    </h1>

                    <div className="bg-yellow-100 text-orange-500 px-2 md:px-3 py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium outline outline-amber-300">
                        Customer
                    </div>
                </div>

                {/* DESKTOP MENU */}
                <div className="hidden lg:flex gap-3 items-center">

                    <button
                        onClick={() => setShowCart(true)}
                        className="relative px-4 py-2 text-sm font-medium text-white rounded-lg bg-black"
                    >
                        <ShoppingCart className="w-4 h-4 inline-block mr-2" />
                        Cart

                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={gotodashboard}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-black"
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={gotoorder}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-black"
                    >
                        My Orders
                    </button>

                    <button
                        onClick={handlelogout}
                        className="w-10 h-10 rounded-full  flex items-center justify-center hover:bg-red-50 transition"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                {/* MOBILE RIGHT */}
                <div className="flex lg:hidden items-center gap-2">

                    {/* MOBILE CART */}
                    <button
                        onClick={() => setShowCart(true)}
                        className="relative w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center"
                    >
                        <ShoppingCart className="w-5 h-5" />

                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </button>

                    {/* MENU BUTTON */}
                    <button
                        onClick={() => setMobileMenu(!mobileMenu)}
                        className="w-10 h-10 rounded-lg border flex items-center justify-center"
                    >
                        {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* MOBILE MENU */}
                {mobileMenu && (
                    <div className="absolute top-16 right-4 bg-white border shadow-xl rounded-2xl p-4 flex flex-col gap-3 w-56 lg:hidden">

                        <button
                            onClick={() => {
                                gotodashboard("");
                                setMobileMenu(false);
                            }}
                            className="w-full py-3 rounded-xl bg-black text-white text-sm"
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => {
                                gotoorder("");
                                setMobileMenu(false);
                            }}
                            className="w-full py-3 rounded-xl bg-black text-white text-sm"
                        >
                            My Orders
                        </button>

                        <button
                            onClick={() => {
                                handlelogout();
                                setMobileMenu(false);
                            }}
                            className="w-full py-3 rounded-xl bg-red-500 text-white text-sm"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>


           <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-32">


                <div className="md:col-span-2 space-y-4">
                   <div className="py-5 md:py-6 px-4 md:px-6 bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl">

                        {loadd ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-7 w-56 bg-orange-300 rounded"></div>

                                <div className="h-3 w-56 bg-orange-200 rounded"></div>
                            </div>
                        ) : (
                            <>
                              <h1 className="text-xl md:text-2xl font-bold break-words">
                                    {datas?.vendor?.businessName?.toUpperCase()}
                                </h1>

                               <p className="text-black text-[11px] md:text-xs mt-1 break-words">
                                    {datas?.vendor?.businessAddress}
                                </p>
                            </>
                        )}
                        <p className="text-black text-sm mt-1">
                            Browse available products
                        </p>
                    </div>

                    <h2 className="font-semibold text-lg md:text-xl">
  Menu
</h2>
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-xl border p-4 flex items-center justify-between animate-pulse"
                                >

                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg" />

                                        <div className="space-y-2">
                                            <div className="h-3 w-32 bg-gray-200 rounded" />
                                            <div className="h-3 w-20 bg-gray-200 rounded" />
                                        </div>
                                    </div>


                                    <div className="w-16 h-8 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredProducts?.length === 0 ? (
                                <div className="col-span-full text-center py-20">
                                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        No products found
                                    </h3>
                                    <p className="text-gray-500">
                                        This vendor has no products yet
                                    </p>
                                </div>
                            ) : (
                                filteredProducts?.map((item: any) => {
                                    const inCart = cart.find((c) => c.id === item.id);

                                    return (
                                        <div
                                            key={item.id}

                                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                                        >

                                            <div className="relative h-52 sm:h-56 md:h-60 overflow-hidden bg-gray-100">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>


                                           <div className="p-4 md:p-5 flex flex-col gap-3">
                                                <div>
                                                    <h3 className="font-semibold text-base md:text-lg text-gray-800 truncate">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        In Stock
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between gap-3 mt-2">
                                                    <span className="text-xl font-bold text-orange-600">
                                                        ₦{item.price}
                                                    </span>

                                                    {inCart ? (
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => updateQty(item.id, -1)}
                                                                className="w-9 h-9 rounded-lg border hover:bg-gray-100"
                                                            >
                                                                -
                                                            </button>

                                                            <span className="font-medium">{inCart.qty}</span>

                                                            <button
                                                                onClick={() => updateQty(item.id, 1)}
                                                                className="w-9 h-9 rounded-lg border hover:bg-gray-100"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                           className="px-4 md:px-5 py-2 bg-orange-500 text-white rounded-xl text-xs md:text-sm hover:bg-orange-600 transition whitespace-nowrap"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>)}
                </div>



            </div>

            {cart.length > 0 && !showCart && (
                <button
                    onClick={() => setShowCart(true)}
                    className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg"
                >
                    <ShoppingCart className="w-5 h-5" />
                </button>
            )}

            {cart.length > 0 && showCart && (
                <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:max-w-sm z-50">
                    <div className="bg-white border shadow-2xl rounded-t-3xl sm:rounded-2xl p-4 space-y-4">

                        {/* HEADER */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-orange-600" />
                                <h3 className="font-semibold text-gray-800 text-sm">
                                    Your Cart ({cart.length})
                                </h3>
                            </div>

                            <div className="flex items-center gap-2">

                                {/* CLEAR CART */}
                                {cart.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                                    >
                                        Clear
                                    </button>
                                )}

                                {/* CLOSE */}
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="text-gray-400 hover:text-gray-600 text-lg"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>


                        <div className="space-y-2 max-h-52 overflow-y-auto">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                   className="flex justify-between text-sm text-gray-700"
                                >
                                    <span className="truncate w-3/4">
                                        {item.name}
                                    </span>
                                    <span className="font-medium">
                                        x{item.qty}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 required">
                                Delivery Address
                            </label>

                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Enter your delivery address..."
                                className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>

                        <div className="border-t pt-3 space-y-3">


                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₦{subtotal}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span>₦{deliveryFee}</span>
                                </div>

                                <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2">
                                    <span>Total</span>
                                    <span>₦{total}</span>
                                </div>
                            </div>


                            <button
                                onClick={payWithPaystack}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold transition"
                            >
                                Checkout
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}