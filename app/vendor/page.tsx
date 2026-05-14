"use client"
import React from 'react'
import { useEffect, useState } from 'react'
import { ShoppingBag, DollarSign, Box, Clock, LogOut, Menu, X } from "lucide-react";
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { TailSpin } from "react-loader-spinner";
import { useRouter } from 'next/navigation';


type MeResponse = {
  me: {
    name: string;
    role: string;
    businessType: string
  };
};
type Post = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  createdAt: string;
};

type PostResponse = {
  posts: {
    posts: Post[];
    total: number;
    totalpages: number;
  };
};
type VendorStatsResponse = {
  vendorStats: {
    totalOrders: number;
    revenue: number;
    pendingOrders: number;
    totalProducts: number;
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
export const CREATE_POST = gql`
  mutation CreatePost(
    $name: String!
    $price: Float!
    $category: String!
    $image: String!

  ) {
    createPost(
      name: $name
      price: $price
      category: $category
      image: $image
    ) {
      id
      name
      price
      image
      category
      createdAt
    }
  }
`;
export const GET_POSTS = gql`
  query GetPosts($page: Int, $limit: Int) {
    posts(page: $page, limit: $limit) {
      posts {
        id
        name
        price
        image
        category
        createdAt
      }
      total
      totalpages
    }
  }
`;
export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;
export const UPDATE_POST = gql`
  mutation UpdatePost(
    $id: ID!
    $name: String!
    $price: Float!
    $category: String!
    $image: String!
  ) {
    updatePost(
      id: $id
      name: $name
      price: $price
      category: $category
      image: $image
    ) {
      id
      name
      price
      image
      category
    }
  }
`;
const GET_VENDOR_STATS = gql`
  query {
    vendorStats {
      totalOrders
      revenue
      pendingOrders
      totalProducts
    }
  }
`;
const page = () => {
  const router = useRouter()
  const [openModal, setOpenModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, error } = useQuery<MeResponse>(ME);
  const [createPost, { loading }] = useMutation(CREATE_POST);
  const [deletePost] = useMutation(DELETE_POST);
  const { data: statsData } = useQuery<VendorStatsResponse>(GET_VENDOR_STATS);
  const [page, setPage] = useState(1);
  const limit = 3;
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
  });
  const { data: postData, loading: loads, refetch } = useQuery<PostResponse>(GET_POSTS, {
    variables: { page, limit },
  });
  const [updatePost, { loading: updateLoading }] = useMutation(UPDATE_POST);
  useEffect(() => {
    if (data?.me?.name) {
      setUserName(data.me.name);
    }
  }, [data]);
  useEffect(() => {
    if (data?.me) {
      setUserName(data.me.name);
      setBusinessType(data.me.businessType);
    }
  }, [data]);
  const handleImage = (e: any) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setForm({ ...form, image: reader.result as string });
    };
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image) {
      toast.error("All field are mandatory");
      return;
    }

    try {
      await createPost({
        variables: {
          name: form.name,
          price: Number(form.price),
          category: businessType,
          image: form.image,
        },
      });
      toast.success("Product uploaded successfully");
      setOpenModal(false);
      setForm({ name: "", price: "", image: "" });
      refetch({ page, limit });
    } catch (err: any) {
      console.log(err);
      toast.error(err.message);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await deletePost({ variables: { id } });
      toast.success("Deleted successfully");

      const totalItems = postData?.posts?.total || 0;
      const newTotalItems = totalItems - 1;

      const newTotalPages = Math.ceil(newTotalItems / limit) || 1;


      if (page > newTotalPages) {
        setPage(newTotalPages);
      } else {
        refetch();
      }

    } catch (err: any) {
      toast.error(err.message);
    }
  };;

  const handleEditClick = (post: Post) => {
    setEditPost(post);
    setForm({
      name: post.name,
      price: String(post.price),
      image: post.image,
    });
    setOpenModal(true)
  };
  const handleUpdate = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image) {
      toast.error("All field are mandatory");
      return;
    }
    try {
      await updatePost({
        variables: {
          id: editPost?.id,
          name: form.name,
          price: Number(form.price),
          category: businessType,
          image: form.image || editPost?.image,
        },
      });

      toast.success("Product updated successfully");
      setOpenModal(false);
      setEditPost(null);
      setForm({ name: "", price: "", image: "" });
      refetch({ page, limit });
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditPost(null);
    setForm({ name: "", price: "", image: "" });
  };
  const gotoorder = () => {
    router.push('/vendor/order')
  }

  const filteredPosts =
    postData?.posts?.posts?.filter((post) => {
      const q = search.toLowerCase();

      return (
        post.name.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        String(post.price).includes(q)
      );
    }) || [];

   const hasProducts = (postData?.posts?.posts ?? []).length > 0;
    const hasSearchResults = filteredPosts.length > 0;
  useEffect(() => {
    refetch({ page, limit });
  }, [page]);
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
    <div className='bg-gray-50  min-h-screen '>
      <div className="w-full flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b sticky top-0 backdrop-blur-md z-50">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">
            SwiftDrop
          </h1>

          <div className="bg-yellow-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium outline outline-amber-300">
            Vendor
          </div>
        </div>

        {/* Desktop logout */}
        <button
          className="hidden md:flex items-center gap-2 text-gray-700 hover:text-red-500 transition"
          onClick={handlelogout}
        >
          <LogOut size={20} />

        </button>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg w-40 p-3 flex flex-col gap-3 md:hidden z-50">

            <button
              className="flex items-center justify-center gap-2 text-gray-700 hover:text-red-500"
              onClick={handlelogout}
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>
        )}
      </div>
      <div className='px-4 md:px-8 lg:px-16 xl:px-24 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5'>

        <div>
          <p className='text-black text-2xl md:text-3xl font-bold break-words'>
            {userName}
          </p>

          <p className='text-gray-500 text-sm md:text-base mt-1'>
            Welcome back! Here's your store overview.
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto'>

          <button
            onClick={() => setOpenModal(true)}
            className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm md:text-base bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 text-white hover:shadow-lg"
          >
            + Add Product
          </button>

          <button
            onClick={gotoorder}
            className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm md:text-base text-black outline outline-gray-200 hover:text-white hover:bg-black"
          >
            View Orders
          </button>

        </div>
      </div>
      <div className="px-4 md:px-8 lg:px-16 xl:px-24 mt-4 flex justify-center">
        <div className="w-full max-w-xl relative">

          <input
            type="text"
            placeholder="Search for your product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

        </div>
      </div>
      <div className="px-4 md:px-8 lg:px-16 xl:px-24 mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

  {/* TOTAL ORDERS */}
  <div className="group relative bg-white p-6 rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition">

    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
      <ShoppingBag className="text-orange-500" />
    </div>

    <p className="text-gray-500 text-sm mt-4">
      Total Orders
    </p>

    <h2 className="text-3xl font-bold text-gray-900 mt-1">
      {statsData?.vendorStats?.totalOrders || 0}
    </h2>

    <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>
  </div>

  {/* REVENUE */}
  <div className="group relative bg-white p-6 rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition">

    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
      <DollarSign className="text-green-600" />
    </div>

    <p className="text-gray-500 text-sm mt-4">
      Revenue
    </p>

    <h2 className="text-3xl font-bold text-gray-900 mt-1">
      ₦{statsData?.vendorStats?.revenue?.toLocaleString() || 0}
    </h2>

    <div className="absolute left-0 bottom-0 h-1 w-0 bg-green-500 transition-all duration-300 group-hover:w-full"></div>
  </div>

  {/* PRODUCTS */}
  <div className="group relative bg-white p-6 rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition">

    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
      <Box className="text-blue-600" />
    </div>

    <p className="text-gray-500 text-sm mt-4">
      Products
    </p>

    <h2 className="text-3xl font-bold text-gray-900 mt-1">
      {statsData?.vendorStats?.totalProducts || 0}
    </h2>

    <div className="absolute left-0 bottom-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></div>
  </div>

  {/* PENDING */}
  <div className="group relative bg-white p-6 rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition">

    <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
      <Clock className="text-yellow-600" />
    </div>

    <p className="text-gray-500 text-sm mt-4">
      Pending Orders
    </p>

    <h2 className="text-3xl font-bold text-gray-900 mt-1">
      {statsData?.vendorStats?.pendingOrders || 0}
    </h2>

    <div className="absolute left-0 bottom-0 h-1 w-0 bg-yellow-500 transition-all duration-300 group-hover:w-full"></div>
  </div>

</div>
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 mt-10">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">

          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b bg-gray-50">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              My Products
            </h2>
          </div>

         {loads ? (
  <div className="flex items-center justify-center py-16 sm:py-20">
    <TailSpin height="50" width="50" color="#f97316" />
  </div>
) : !hasProducts ? (
  // 👉 no products at all (empty database)
  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
    <Box size={40} className="mb-3 text-gray-400" />
    <p className="text-lg font-medium">No products available</p>
    <p className="text-sm">Start by adding your first product</p>
  </div>
) : !hasSearchResults ? (
  // 👉 search returned nothing
  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
    <Box size={40} className="mb-3 text-gray-400" />
    <p className="text-lg font-medium">No products found</p>
    <p className="text-sm">
      Try searching product name
    </p>
  </div>
) : (
  <>
              {/* ================= DESKTOP TABLE ================= */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">

                  <thead className="bg-gray-100 text-gray-600 text-sm">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredPosts.map((post: any) => (
                      <tr key={post.id} className="hover:bg-gray-50 transition">

                        <td className="p-4">
                          <img
                            src={post.image}
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                        </td>

                        <td className="p-4 font-medium text-gray-800">
                          {post.name}
                        </td>

                        <td className="p-4 font-semibold text-gray-900">
                          ₦{post.price}
                        </td>

                        <td className="p-4">
                          <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-600 font-medium">
                            {post.category}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(post)}
                              className="px-3 py-1 text-xs rounded-lg bg-blue-500 text-white"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => setDeleteId(post.id)}
                              className="px-3 py-1 text-xs rounded-lg bg-red-500 text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* ================= MOBILE CARDS ================= */}
              <div className="md:hidden p-4 space-y-4">

                {filteredPosts.map((post: any) => (
                  <div
                    key={post.id}
                    className="border rounded-xl p-4 shadow-sm bg-white"
                  >

                    <div className="flex items-center gap-3">
                      <img
                        src={post.image}
                        className="w-14 h-14 rounded-lg object-cover border"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {post.name}
                        </h3>

                        <p className="text-gray-500 text-sm">
                          ₦{post.price}
                        </p>

                        <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">

                      <button
                        onClick={() => handleEditClick(post)}
                        className="flex-1 py-2 text-xs rounded-lg bg-blue-500 text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteId(post.id)}
                        className="flex-1 py-2 text-xs rounded-lg bg-red-500 text-white"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            </>
)}






 
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-3 mt-6 px-4 pb-10">

        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm text-gray-600 text-center">
          Page {Math.min(page, postData?.posts?.totalpages || 1)} of{" "}
          {postData?.posts?.totalpages || 1}
        </span>

        <button
          disabled={page === postData?.posts?.totalpages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Next
        </button>

      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">

          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-fadeIn">


            <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-5 text-white flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editPost ? "Edit Product" : "Add New Product"}</h2>

              <button
                onClick={handleCloseModal}
                className="text-white text-xl hover:scale-110 transition"
              >
                ✕
              </button>
            </div>


            <form
              onSubmit={editPost ? handleUpdate : handleSubmit}
              className="p-6 space-y-4">


              <div>
                <label className="text-sm text-gray-600">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Nike Air Max"
                  className="w-full mt-1 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-sm text-gray-600">Price</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="₦ 0.00"
                  className="w-full mt-1 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>


              <div>
                <label className="text-sm text-gray-600">Category</label>
                <input
                  value={businessType}
                  disabled
                  type="text"
                  placeholder="e.g. Fashion, Food, Electronics"
                  className="w-full mt-1 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>


              <div>
                <label className="text-sm text-gray-600">Product Image</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImage}
                  className="w-full mt-1 border border-dashed border-gray-300 p-3 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-600 hover:file:bg-orange-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"

                  onClick={handleCloseModal}
                  className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:shadow-lg transition disabled:opacity-50"
                >
                  {updateLoading
                    ? "Updating..."
                    : loading
                      ? "Uploading..."
                      : editPost
                        ? "Update Product"
                        : "Create Product"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">

            <h2 className="text-lg font-semibold text-gray-800">
              Confirm Delete
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-5">

              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDelete(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
              >
                Yes, Delete
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default page