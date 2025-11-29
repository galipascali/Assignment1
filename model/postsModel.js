const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("post", postSchema);
