import mongoose from "mongoose";
import { usermodel } from "./model/usermodel";
import bcrypt from "bcryptjs";



const connect = async () => {
  try {
    const uri = process.env.MONGOURI;
    const connection = await mongoose.connect(uri!);
    const email = process.env.EMAIL
    const password = process.env.PASS_WORD ?? ''
    if (connection) {
      console.log("database connected");


      const existingAdmin = await usermodel.findOne({
        email: email,
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(password, 10);

        await usermodel.create({
          name: "Admin",
          email: email,
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