import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    name:{type:String, required:true},
    price:{type:Number, required:true},
    author:{type:mongoose.Schema.Types.ObjectId, required:true},
    image:{type:String, required:true},
    category:{type:String, required:true},
   


  },
  { timestamps: true }
);

export const PostModel = mongoose.models.Post || mongoose.model("Post", postSchema);