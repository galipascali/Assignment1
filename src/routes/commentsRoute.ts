import express from "express";
import { commentsController } from "../controllers/commentsController";
import authMiddleware from "../middleware/auth";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  commentsController.post.bind(commentsController)
);

router.get(
  "/",
  authMiddleware,
  commentsController.get.bind(commentsController)
);

router.put(
  "/:id",
  authMiddleware,
  commentsController.put.bind(commentsController)
);

router.delete(
  "/:id",
  authMiddleware,
  commentsController.delete.bind(commentsController)
);

export default router;
