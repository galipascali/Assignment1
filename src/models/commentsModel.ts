import mongoose from "mongoose";
import PostSchema from "./postsModel";

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: PostSchema.modelName,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
});

export default mongoose.model("comment", commentSchema);
