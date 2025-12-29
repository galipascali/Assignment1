import express from "express";
import { postsController } from "../controllers/postsController";
import authMiddleware from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, postsController.post.bind(postsController));

router.get("/", authMiddleware, postsController.get.bind(postsController));

router.get(
  "/:id",
  authMiddleware,
  postsController.getById.bind(postsController)
);

router.put("/:id", authMiddleware, postsController.put.bind(postsController));

export default router;
