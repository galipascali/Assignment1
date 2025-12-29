import mongoose from "mongoose";
import PostModel from "./postsModel";
import UserModel from "./userModel";

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: PostModel.modelName,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.modelName,
    required: true,
  },
});

export default mongoose.model("comment", commentSchema);
