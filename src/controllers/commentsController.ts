import commentsModel from "../models/commentsModel";
import BaseController from "./BaseController";

export const commentsController = new BaseController(commentsModel);
