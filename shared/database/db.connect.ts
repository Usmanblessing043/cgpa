import mongoose from "mongoose";
import { usermodel } from "./model/usermodel";
import bcrypt from "bcryptjs";

const connect = async () => {
  try {
    const uri = process.env.MONGOURI;
    const connection = await mongoose.connect(uri!);

    if (connection) {
      console.log("database connected");


      const existingAdmin = await usermodel.findOne({
        email: "admin@gmail.com",
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("1234567q!", 10);

        await usermodel.create({
          name: "Admin",
          email: "admin@gmail.com",
          password: hashedPassword,
          role: "admin",
          phone: "08000000000",
        });+

        console.log(" Admin created");
      } else {
        console.log(" Admin already exists");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export default connect;