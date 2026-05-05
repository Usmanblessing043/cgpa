import { usermodel } from "../database/model/usermodel";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import cloudinary from "../lib/cloudinary";
import { NextResponse } from "next/server";
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

export const userresolvers = {

  Query: {
    users: async (_: any, __: any, context: any) => {
      requireAdmin(context);
      return await usermodel.find();
    },

    oneuser: async (_: any, { id }: { id: string }) => {
      return await usermodel.findById(id);
    },
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated");
      }

      const user = await usermodel.findById(context.user.id);
      return user;
    },
    vendors: async () => {
      return await usermodel.find({ role: "vendor" });

    },
    adminUsers: async (_: any, __: any, context: any) => {
      requireAdmin(context);
      return await usermodel.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
    },


  },

  Mutation: {
    createuser: async (_: any, { input }: any) => {
      try {
        const {
          name,
          email,
          password,
          role,
          phone,
          businessName,
          businessAddress,
          businessType,
          vehicleType,
          vehicleNumber,
        } = input;

        if (!name || !email || !password || !role) {
          throw new GraphQLError("Required fields missing");
        }
        const orConditions: any[] = [{ email }];

        if (phone) orConditions.push({ phone });
        if (businessName) orConditions.push({ businessName });
        if (vehicleNumber) orConditions.push({ vehicleNumber });

        const conflict = await usermodel.findOne({ $or: orConditions });


        if (conflict) {
          if (conflict.email === email) {
            throw new GraphQLError("Email already registered");
          }
          if (conflict.phone === phone) {
            throw new GraphQLError("Phone number already registered");
          }
          if (businessName && conflict.businessName === businessName) {
            throw new GraphQLError("Business name already registered");
          }
          if (vehicleNumber && conflict.vehicleNumber === vehicleNumber) {
            throw new GraphQLError("Vehicle number already registered");
          }
        }


        const hashedpassword = await bcrypt.hash(password, 10);

        const newuser = await usermodel.create({
          name,
          email,
          password: hashedpassword,
          role,
          phone,
          businessName,
          businessAddress,
          businessType,
          vehicleType,
          vehicleNumber,
        });

        return newuser;
      } catch (error) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message);
        }
      }
    },

    login: async (_: any, { email, password }: any) => {
      try {
        const user = await usermodel.findOne({ email });

        if (!user) {
          throw new GraphQLError("User not found");
        }

        if (user.isBanned) {
          throw new GraphQLError("Your account has been banned. Contact support.");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          throw new GraphQLError("Invalid email or password");
        }

        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            role: user.role,
            businessType: user.businessType,
          },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        return { user, token };
      } catch (error) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message);
        }
      }
    },


    updateCart: async (_: any, { cart }: any, context: any) => {
      console.log("USER FROM CONTEXT:", context.user);

      if (!context.user) {
        throw new GraphQLError("Not authenticated");
      }

      const updatedUser = await usermodel.findByIdAndUpdate(
        context.user.id,
        { cart },
        { new: true }
      );

      return updatedUser;
    },
    deleteUser: async (_: any, { id }: any, context: any) => {
      requireAdmin(context);

      await usermodel.findByIdAndDelete(id);

      return "User deleted";
    },
    banUser: async (_: any, { id }: any, context: any) => {
      requireAdmin(context);

      const user = await usermodel.findById(id);

      if (!user) throw new GraphQLError("User not found");

      user.isBanned = true;
      await user.save();

      return "User banned";
    },

    unbanUser: async (_: any, { id }: any, context: any) => {
      requireAdmin(context);

      const user = await usermodel.findById(id);

      if (!user) throw new GraphQLError("User not found");

      user.isBanned = false;
      await user.save();

      return "User unbanned";
    },
  },

  User: {
    id: (parent: any) => parent._id.toString(),
    createdAt: (parent: any) =>
      parent.createdAt ? parent.createdAt.toISOString() : null,
  },
};