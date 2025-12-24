import express from "express";
import { postsController } from "../controllers/postsController";

const router = express.Router();

router.post("/", postsController.post.bind(postsController));

router.get("/", postsController.get.bind(postsController));

router.get("/:id", postsController.getById.bind(postsController));

router.put("/:id", postsController.put.bind(postsController));

export default router;
