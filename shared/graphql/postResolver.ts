// import { usermodel } from "../database/model/usermodel";
import { PostModel } from "../database/model/postmodel";
import { usermodel } from "../database/model/usermodel";
import { OrderModel } from "../database/model/ordermodel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { GraphQLError } from "graphql";
import cloudinary from "../lib/cloudinary";
import { ORDER_EVENTS, pubsub } from "@/lib/pubsub";
import nodemailer from "nodemailer";
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);

const requireAdmin = (context: any) => {
    if (!context.user || context.user.role !== "admin") {
        throw new GraphQLError("Admin access only");
    }
};

export const sendEmail = async (to: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"SwiftDrop" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your Delivery Verification Code",
        html: `
      <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
        
        <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
          
          
          <h2 style="text-align:center; color:#ea580c; margin-bottom:10px;">
            SwiftDrop 
          </h2>

          <p style="text-align:center; color:#6b7280; font-size:14px;">
            Delivery Verification Code
          </p>

          <!-- OTP Box -->
          <div style="margin:30px 0; text-align:center;">
            <span style="
              display:inline-block;
              padding:15px 25px;
              font-size:28px;
              letter-spacing:6px;
              font-weight:bold;
              color:#111827;
              background:#fff7ed;
              border:2px dashed #fb923c;
              border-radius:10px;
            ">
              ${otp}
            </span>
          </div>

          <!-- Message -->
          <p style="color:#374151; font-size:14px; text-align:center;">
            Use this code to confirm your delivery.
          </p>

          <p style="color:#ef4444; font-size:13px; text-align:center; margin-top:10px;">
           This code will expire in 5 minutes.
          </p>

          <!-- Footer -->
          <div style="margin-top:30px; text-align:center; font-size:12px; color:#9ca3af;">
            If you didn’t request this, please ignore this email.
          </div>

        </div>
      </div>
    `,
    });
};




type contexttype = {
    user?: {
        email: string
        id: string
        iat: number
        businessType: string
    }
}

export const postresolvers = {


    Query: {

        posts: async (_: any, { page = 1, limit = 10 }: any, context: contexttype) => {
            const { user } = context;

            if (!user) throw new GraphQLError("Unauthorized");

            const skip = (page - 1) * limit;

            const total = await PostModel.countDocuments({ author: user.id });

            const posts = await PostModel.find({ author: user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            return {
                posts,
                total,
                totalpages: Math.ceil(total / limit),
            };
        },
        post: async (_: any, { id }: { id: string }) => {
            return await PostModel.findById(id);
        },
        vendorPosts: async (_: any, { vendorId }: any) => {
            return await PostModel.find({ author: vendorId });
        },
        vendor: async (_: any, { id }: { id: string }) => {
            return await usermodel.findById(id);
        },

        myOrders: async (_: any, __: any, context: any) => {
            return await OrderModel.find({ customer: context.user.id }).sort({ createdAt: -1 });
        },
        vendorOrders: async (_: any, __: any, context: any) => {
            return await OrderModel.find({ vendor: context.user.id }).sort({ createdAt: -1 });
        },
        riderOrders: async (_: any, __: any, context: any) => {
            if (!context.user) throw new GraphQLError("Unauthorized");

            return await OrderModel.find({
                status: "ready_for_pickup",
                rider: null,
                rejectedBy: { $ne: context.user.id },
            }).sort({ createdAt: -1 });
        },
        myRiderOrders: async (_: any, __: any, context: any) => {
            return await OrderModel.find({
                rider: context.user.id,
                status: { $in: ["accepted", "in_transit"] },
            });
        },

        completedRiderOrders: async (_: any, __: any, context: any) => {
            if (!context.user) throw new GraphQLError("Unauthorized");

            return await OrderModel.find({
                rider: context.user.id,
                status: "delivered",
            }).sort({ createdAt: -1 })
        },
        allOrders: async (_: any, __: any, context: any) => {
            requireAdmin(context);
            return await OrderModel.find()
                .populate("customer", "name")
                .populate("vendor", "businessName")
                .populate("rider", "phone")
                .sort({ createdAt: -1 });
        },
        adminStats: async (_: any, __: any, context: any) => {
            requireAdmin(context);

            const totalUsers = await usermodel.countDocuments({ role: { $ne: "admin" } });
            const totalOrders = await OrderModel.countDocuments();
            const totalVendors = await usermodel.countDocuments({ role: "vendor" });
            const totalRiders = await usermodel.countDocuments({ role: "rider" });

            const revenue = await OrderModel.aggregate([
                { $match: { status: "delivered" } },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]);

            return {
                totalUsers,
                totalOrders,
                totalVendors,
                totalRiders,
                revenue: revenue[0]?.total || 0,
            };
        },

        vendorStats: async (_: any, __: any, context: any) => {
    if (!context.user) {
        throw new GraphQLError("Unauthorized");
    }

    const vendorId = context.user.id;

    const DELIVERY_FEE = 1500;

    // only accepted orders
   const orders = await OrderModel.find({
    vendor: vendorId,
    status: {
        $in: [
            "confirmed",
            "preparing",
            "ready_for_pickup",
            "accepted",
            "in_transit",
            "delivered",
        ],
    },
});

    const revenue = orders.reduce((acc, order) => {

        const vendorRevenue =
            order.total > DELIVERY_FEE
                ? order.total - DELIVERY_FEE
                : 0;

        return acc + vendorRevenue;

    }, 0);

    const totalOrders = await OrderModel.countDocuments({
        vendor: vendorId,
    });

    const pendingOrders = await OrderModel.countDocuments({
        vendor: vendorId,
        status: "pending",
    });

    const totalProducts = await PostModel.countDocuments({
        author: vendorId,
    });

    return {
        totalOrders,
        revenue,
        pendingOrders,
        totalProducts,
    };
},
    },


    Mutation: {


        createPost: async (_: any, { name, price, category, image }: any, context: contexttype) => {
            try {

                const { user } = context
                console.log(user);
                if (!user) {
                    throw new GraphQLError("invalid user")
                }
                console.log("CREATE POST");
                console.log({ name, price, category, image });

                if (!name || !price || !category || !image) {
                    throw new GraphQLError("All fields are mandatory");
                }

                const uploader = await cloudinary.uploader.upload(image);
                console.log("UPLOAD RESULT:", uploader);

                const post = await PostModel.create({
                    name,
                    price,
                    image: uploader.secure_url,
                    category: user.businessType,
                    author: user.id


                });

                console.log("POST CREATED:", post);

                return post;
            } catch (error) {
                console.error("CREATE POST ERROR:", error);
                if (error instanceof Error) {
                    throw new GraphQLError(error.message);
                }
            }
        },
        deletePost: async (_: any, { id }: any, context: contexttype) => {
            try {
                const { user } = context;

                if (!user) {
                    throw new GraphQLError("Invalid user");
                }

                const oneuser = await usermodel.findById(user.id);

                if (!oneuser) {
                    throw new GraphQLError("User not found");
                }

                const deletepost = await PostModel.findOneAndDelete({
                    _id: id,
                    author: oneuser.id
                });

                if (!deletepost) {
                    throw new GraphQLError("You cannot delete another user's post");
                }

                return "Post deleted successfully";

            } catch (error) {
                if (error instanceof Error) {
                    throw new GraphQLError(error.message);
                }
            }
        },
        updatePost: async (_: any, args: any, context: contexttype) => {
            try {
                const { user } = context;

                if (!user) {
                    throw new GraphQLError("Invalid User");
                }

                const oneuser = await usermodel.findById(user.id);

                if (!oneuser) {
                    throw new GraphQLError("User not found");
                }
                const updateData = {
                    name: args.name,
                    price: args.price,
                    category: args.category,
                    image: args.image,
                };

                const updatedPost = await PostModel.findOneAndUpdate(
                    {
                        _id: args.id,
                        author: oneuser.id
                    },
                    updateData,
                    { new: true }
                );

                if (!updatedPost) {
                    throw new GraphQLError("You cannot edit another user's post");
                }

                return updatedPost;

            } catch (error) {
                if (error instanceof Error) {
                    throw new GraphQLError(error.message);
                }
            }
        },

        createOrder: async (_: any, { items, total, deliveryAddress, vendorId }: any, context: any) => {
            if (!context.user) throw new GraphQLError("Unauthorized");

            const order = await OrderModel.create({
                customer: context.user.id,
                vendor: vendorId,
                items,
                total,
                deliveryAddress,
                status: "pending",
            });
            pubsub.publish(ORDER_EVENTS.NEW_ORDER, {
                newOrder: order,
            });
            return order;
        },
        updateOrderStatus: async (_: any, { id, status }: any) => {
            const updated = await OrderModel.findByIdAndUpdate(
                id,
                {
                    status,
                    $push: {
                        statusHistory: { status, time: new Date() },
                    },
                },
                { new: true }
            );


            pubsub.publish(ORDER_EVENTS.ORDER_UPDATED, {
                orderUpdated: updated,
            });

            return updated;
        },
        acceptOrder: async (_: any, { id }: any, context: any) => {
            if (!context.user) throw new GraphQLError("Unauthorized");

            return await OrderModel.findByIdAndUpdate(
                id,
                {
                    status: "accepted",
                    rider: context.user.id,
                },
                { new: true }
            );
        },

        rejectOrder: async (_: any, { id }: any, context: any) => {
            if (!context.user) throw new GraphQLError("Unauthorized");

            return await OrderModel.findByIdAndUpdate(
                id,
                {
                    $addToSet: { rejectedBy: context.user.id },
                },
                { new: true }
            );
        },
        sendDeliveryOTP: async (_: any, { id }: any, context: any) => {
            if (!context.user) throw new GraphQLError("Unauthorized");

            const order = await OrderModel.findById(id).populate("customer", "email");

            if (!order) throw new GraphQLError("Order not found");
            if (order.rider.toString() !== context.user.id) {
                throw new GraphQLError("Not your order");
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            order.deliveryOTP = otp;
            order.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

            await order.save();


            await sendEmail(order.customer.email, otp);

            return "OTP sent";
        },
        verifyDeliveryOTP: async (_: any, { id, otp }: any, context: any) => {
            if (!context.user) throw new GraphQLError("Unauthorized");
            const order = await OrderModel.findById(id);

            if (!order) throw new GraphQLError("Order not found");

            if (order.deliveryOTP !== otp) {
                throw new GraphQLError("Invalid OTP");
            }

            if (order.otpExpires < new Date()) {
                throw new GraphQLError("OTP expired");
            }

            order.status = "delivered";
            order.deliveryOTP = null;

            await order.save();

            return order;
        }



    },



    Subscription: {
        newOrder: {
            subscribe: () => (pubsub as any).asyncIterator([ORDER_EVENTS.NEW_ORDER]),
        },

        orderUpdated: {
            subscribe: () => (pubsub as any).asyncIterator([ORDER_EVENTS.ORDER_UPDATED]),
        },
    },

    Order: {
        id: (parent: any) => parent._id.toString(),

        createdAt: (parent: any) =>
            parent.createdAt ? parent.createdAt.toISOString() : null,


        statusHistory: (parent: any) =>
            (parent.statusHistory || []).map((h: any) => ({
                status: h.status,
                time: h.time ? new Date(h.time).toISOString() : null,
            })),

    },

    AdminOrder: {
        id: (parent: any) => parent._id.toString(),
        createdAt: (parent: any) =>
            parent.createdAt ? parent.createdAt.toISOString() : null,
    },
















}