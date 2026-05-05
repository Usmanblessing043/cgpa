"use client"
import React from 'react'
import { useEffect, useState } from 'react'
import { ShoppingBag, DollarSign, Box, Clock } from "lucide-react";
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
const page = () => {
  const router = useRouter()
  const [openModal, setOpenModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data, error } = useQuery<MeResponse>(ME);
  const [createPost, { loading }] = useMutation(CREATE_POST);
  const [deletePost] = useMutation(DELETE_POST);
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
  const gotoorder =() =>{
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
  useEffect(() => {
    refetch({ page, limit });
  }, [page]);
  return (
    <div className='bg-gray-50  min-h-screen '>
      <div className="w-full flex items-center justify-between px-6 py-3 bg-white border-b   sticky top-0 backdrop-blur-md z-100">


        <div className="flex items-center gap-3">
          <h1 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 font-bold">SwiftDrop</h1>

          <div className="bg-yellow-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium outline outline-amber-300">
            Vendor
          </div>
        </div>


        <button>
          Sign out
        </button>
      </div>
      <div className=' px-30 py-3 flex items-center justify-between'>
        <div>
          <p className='text-black text-2xl text-bord'>{userName}</p>
          <p className='text-gray-500'>Welcome back! Here's your store overview.</p>
        </div>
        <div className=' flex gap-2'>


          <button
            onClick={() => setOpenModal(true)}
            className="px-3 md:px-5 py-2 rounded-lg text-sm md:text-base bg-gradient-to-r from-orange-600 via-orange-600 to-orange-400 text-white hover:shadow-lg">
            + Add Product
          </button>
          <button onClick={gotoorder} className="px-3 md:px-5 py-2 rounded-lg text-sm md:text-base  text-black hover:shadow-lg outline outline-gray-200 hover:text-white hover:bg-black">View Orders</button>
        </div>
      </div>
      <div className="px-30 mt-4 flex justify-center">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

        </div>
      </div>
      <div className="px-30 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">


        <div className="group relative bg-white p-6 rounded-xl shadow-sm border cursor-pointer overflow-hidden">
          <ShoppingBag className="text-orange-500" />
          <p className="text-gray-500 text-sm">Total Orders</p>
          <h2 className="text-2xl font-bold text-black mt-2">0</h2>
          <p className="text-green-500 text-sm mt-1">↑ +12%</p>
          <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>
        </div>


        <div className="group relative bg-white p-6 rounded-xl shadow-sm border cursor-pointer overflow-hidden">

          <DollarSign className="text-green-500" />
          <p className="text-gray-500 text-sm">Revenue</p>
          <h2 className="text-2xl font-bold text-black mt-2">$0.00</h2>
          <p className="text-green-500 text-sm mt-1">↑ +8%</p>
          <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>

        </div>


        <div className="group relative bg-white p-6 rounded-xl shadow-sm border cursor-pointer overflow-hidden">

          <Box className="text-blue-500" />

          <p className="text-gray-500 text-sm">Products</p>
          <h2 className="text-2xl font-bold text-black mt-2">0</h2>
          <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>

        </div>


        <div className="group relative bg-white p-6 rounded-xl shadow-sm border cursor-pointer overflow-hidden">

          <Clock className="text-yellow-500" />

          <p className="text-gray-500 text-sm">Pending</p>
          <h2 className="text-2xl font-bold text-black mt-2">0</h2>
          <div className="absolute left-0 bottom-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>

        </div>

      </div>
      <div className="px-6 md:px-30 mt-10">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">

          <div className="p-5 flex items-center justify-between border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              My Products
            </h2>
          </div>


          {loads ? (
            <div className="flex items-center justify-center py-20">
              <TailSpin height="50" width="50" color="#f97316" />
            </div>
          ) : postData?.posts?.posts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Box size={40} className="mb-3 text-gray-400" />
              <p className="text-lg font-medium">No products available</p>
              <p className="text-sm">Start by adding your first product</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">

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

                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="text-center py-10 text-gray-500">
                          No products match your search
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post: any) => (
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
                    ))
                  )}

                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
      <div className="flex justify-center items-center gap-3 mt-6">

        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {Math.min(page, postData?.posts?.totalpages || 1)} of {postData?.posts?.totalpages || 1}
        </span>

        <button
          disabled={page === postData?.posts?.totalpages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>

      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">


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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

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