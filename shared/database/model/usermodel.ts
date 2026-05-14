import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "customer" | "vendor" | "rider" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;


  businessName?: string;
  businessAddress?: string;
  businessType?: string;


  vehicleType?: string;
  vehicleNumber?: string;

  createdAt: Date;
  updatedAt: Date;
  cart: [
    {
      productId: String,
      name: String,
      price: Number,
      qty: Number,
      image: String,
    },
  ],
  isBanned: Boolean
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "vendor", "rider", "admin"],
      default: "customer",
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    cart: {
      type: [
        {
          productId: String,
          name: String,
          price: Number,
          qty: Number,
          image: String,
        },
      ],
      default: [],
    },

    phone: {
      type: String,
      required: true,
    },


    businessName: String,
    businessAddress: String,
    businessType: String,

    vehicleType: String,
    vehicleNumber: String,
  },
  {
    timestamps: true,
  }
);

export const usermodel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);



