const commentModel = require("../models/commentsModel");
const httpStatus = require("http-status");

const createComment = async (req, res) => {
  const commentData = req.body;
  try {
    const newComment = await commentModel.create(commentData);
    res.status(httpStatus.status.CREATED).json(newComment);
  } catch (err) {
    console.error(err);
    res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .send("Error creating comment");
  }
};

const getComments = async (req, res) => {
  try {
    const postId = req.query.postId;

    if (postId) {
      const comments = await commentModel.find({ postId });
      res.json(comments);
    } else {
      const comments = await commentModel.find();
      res.json(comments);
    }
  } catch (err) {
    console.error(err);
    res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .send("Error retrieving comments");
  }
};

const updateComment = async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  console.log(updatedData);
  try {
    const comment = await commentModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.json(comment);
  } catch (err) {
    res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .send("Error updating comment");
  }
};

const deleteComment = async (req, res) => {
  const id = req.params.id;
  try {
    const comment = await commentModel.findByIdAndDelete(id);
    res.json(comment);
  } catch (err) {
    res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .send("Error updating comment");
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
