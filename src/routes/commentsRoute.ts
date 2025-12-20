import express from "express";
import commentsController from "../controllers/commentsController";

const router = express.Router();

router.post("/", commentsController.createComment);

router.get("/", commentsController.getComments);

router.put("/:id", commentsController.updateComment);

router.delete("/:id", commentsController.deleteComment);

export default router;
