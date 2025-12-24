import express from "express";
import { commentsController } from "../controllers/commentsController";

const router = express.Router();

router.post("/", commentsController.post.bind(commentsController));

router.get("/", commentsController.get.bind(commentsController));

router.put("/:id", commentsController.put.bind(commentsController));

router.delete("/:id", commentsController.delete.bind(commentsController));

export default router;
