import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 character"),

  email: z.string().email("Invalid email address"), 

  password: z.string()
    .min(6, "Password must be at least 6 character")
    .regex(/^\S+$/, "Password must not contain spaces")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

 

  role: z.enum(["customer", "vendor", "rider"]),
  phone: z.string().regex(/^(?:\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),


  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessType: z.string().optional(),

 
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().regex(/^[A-Za-z]{3}-[0-9]{3}$/, "Vehicle number must be like ABC-123").optional(),
})
.superRefine((data, ctx) => {


  if (data.role === "vendor") {
    if (!data.businessName) {
      ctx.addIssue({
        path: ["businessName"],
        message: "Business name is required",
        code: z.ZodIssueCode.custom
      })
    }

    if (!data.businessAddress) {
      ctx.addIssue({
        path: ["businessAddress"],
        message: "Business address is required",
        code: z.ZodIssueCode.custom
      })
    }

    if (!data.businessType) {
      ctx.addIssue({
        path: ["businessType"],
        message: "Business type is required",
        code: z.ZodIssueCode.custom
      })
    }
  }

  if (data.role === "rider") {
    if (!data.vehicleType) {
      ctx.addIssue({
        path: ["vehicleType"],
        message: "Vehicle type is required",
        code: z.ZodIssueCode.custom
      })
    }

    if (!data.vehicleNumber) {
      ctx.addIssue({
        path: ["vehicleNumber"],
        message: "Vehicle number is required",
        code: z.ZodIssueCode.custom
      })
    }
  }
})

export type signupFormData = z.infer<typeof signupSchema>



export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),

  password: z.string()
    .min(6, "Password must be at least 6 character")
    .regex(/^\S+$/, "Password must not contain spaces")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

export type loginFormData = z.infer<typeof loginSchema>