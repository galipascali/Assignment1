import { Request, Response } from "express";
import httpStatus from "http-status";
import CommentModel from "../models/commentsModel";

const createComment = async (req: Request, res: Response) => {
  const commentData = req.body;
  try {
    const newComment = await CommentModel.create(commentData);
    res.status(httpStatus.CREATED).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error creating comment");
  }
};

const getComments = async (req: Request, res: Response) => {
  try {
    const postId = req.query.postId;

    if (postId) {
      const comments = await CommentModel.find({ postId });
      res.json(comments);
    } else {
      const comments = await CommentModel.find();
      res.json(comments);
    }
  } catch (err) {
    console.error(err);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send("Error retrieving comments");
  }
};

const updateComment = async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;

  if (updatedData.postId || updatedData.sender) {
    res
      .status(httpStatus.BAD_REQUEST)
      .send("postId or sender can not be sent in update comment request");

    return;
  }
  try {
    const comment = await CommentModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.json(comment);
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error updating comment");
  }
};

const deleteComment = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const comment = await CommentModel.findByIdAndDelete(id);
    res.json(comment);
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error updating comment");
  }
};

export default {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
