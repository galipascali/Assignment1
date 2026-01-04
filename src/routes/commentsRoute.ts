import express from "express";
import { commentsController } from "../controllers/commentsController";
import authMiddleware from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: The Comments API
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - postId
 *             properties:
 *               text:
 *                 type: string
 *               postId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authMiddleware,
  commentsController.post.bind(commentsController)
);

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments (optionally by postId)
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Filter comments by Post ID
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authMiddleware,
  commentsController.get.bind(commentsController)
);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Not authorized to edit this resource
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authMiddleware,
  commentsController.put.bind(commentsController)
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Not authorized to delete this resource
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authMiddleware,
  commentsController.delete.bind(commentsController)
);

export default router;
