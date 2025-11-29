const postModel = require("../model/postsModel");
const httpStatus = require("http-status");
const createPost = async (req, res) => {
  const postData = req.body;
  try {
    const newPost = await postModel.create(postData);
    res.status(httpStatus.status.CREATED).json(newPost);
  } catch (err) {
    console.error(err);
    res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .send("Error creating post");
  }
};

const getAllPosts = async (req, res) => {
  try {
    const sender = req.query.sender;

    if (sender) {
      const posts = await postModel.find({ sender });

      if (!posts) {
        return res
          .status(httpStatus.status.NOT_FOUND)
          .send(`Posts by ${sender} were not found`);
      } else {
        res.json(posts);
      }
    } else {
      const posts = await postModel.find();
      res.json(posts);
    }
  } catch (err) {
    console.error(err);
    res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .send("Error retrieving posts");
  }
};

const getPostById = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).send("Post was not found");
    } else {
      res.json(post);
    }
  } catch (err) {
    console.error(err);
    res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .send(`Error retrieving Post by ID: ${id}`);
  }
};

const updatePost = async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const post = await postModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .send("Error updating post");
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
};
