const mongoose = require("mongoose");
const postSchema = require("./postsModel");

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: postSchema.modelName,
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
module.exports = mongoose.model("comment", commentSchema);
