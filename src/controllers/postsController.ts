import postModel from "../models/postsModel";
import BaseController from "./BaseController";

export const postsController = new BaseController(postModel);
