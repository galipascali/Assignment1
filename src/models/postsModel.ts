import mongoose from "mongoose";
import UserModel from "./userModel";

const postSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.modelName,
    required: true,
  },
});

export default mongoose.model("post", postSchema);
