import { Request, Response } from "express";
import httpStatus from "http-status";
import postModel from "../models/postsModel";

const createPost = async (req: Request, res: Response) => {
  const postData = req.body;
  try {
    const newPost = await postModel.create(postData);
    res.status(httpStatus.CREATED).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error creating post");
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const sender = req.query.sender;

    if (sender) {
      const posts = await postModel.find({ sender });

      if (!posts) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send(`Posts by ${sender} were not found`);
      } else {
        return res.json(posts);
      }
    } else {
      const posts = await postModel.find();
      return res.json(posts);
    }
  } catch (err) {
    console.error(err);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send("Error retrieving posts");
  }
};

const getPostById = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).send("Post was not found");
    } else {
      return res.json(post);
    }
  } catch (err) {
    console.error(err);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send(`Error retrieving Post by ID: ${id}`);
  }
};

const updatePost = async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const post = await postModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error updating post");
  }
};

export default {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
};
