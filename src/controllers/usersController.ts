import { Request, Response } from "express";
import httpStatus from "http-status";
import { encryptPassword } from "../utils";
import User from "../models/userModel";
import { AuthRequest } from "../middleware/auth";

class UsersController {
    async getAll(_req: Request, res: Response) {
        try {
            const users = await User.find().select("-password -refreshToken");
            res.json(users);
        } catch (error) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const user = await User.findById(req.params.id).select(
                "-password -refreshToken"
            );
            if (!user) {
                return res
                    .status(httpStatus.NOT_FOUND)
                    .json({ error: "User not found" });
            }
            return res.json(user);
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const currentUserId = req.user?._id;

            if (id !== currentUserId) {
                return res.status(httpStatus.FORBIDDEN).json({ error: "Not authorized to update this user" });
            }

            const updates = req.body;

            if (updates.password) {
                updates.password = await encryptPassword(updates.password);
            }

            const user = await User.findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true
            }).select("-password -refreshToken");

            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({ error: "User not found" });
            }

            return res.json(user);
        } catch (error) {
            if (error instanceof Error && error.name === "ValidationError") {
                return res.status(httpStatus.BAD_REQUEST).json({ error: error.message });
            }
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const currentUserId = req.user?._id;

            if (id !== currentUserId) {
                return res.status(httpStatus.FORBIDDEN).json({ error: "Not authorized to delete this user" });
            }

            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({ error: "User not found" });
            }

            return res.json({ message: "User deleted successfully" });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}

export const usersController = new UsersController();
