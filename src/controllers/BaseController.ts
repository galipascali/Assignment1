import { Request, Response } from "express";
import httpStatus from "http-status";
import { AuthRequest } from "../middleware/auth";
import { assertExists } from "../utils";

class BaseController {
  model: any;

  constructor(dataModel: any) {
    this.model = dataModel;
  }

  async get(req: Request, res: Response) {
    const filter = req.query;
    try {
      if (filter) {
        const data = await this.model.find(filter);
        res.json(data);
      } else {
        const data = await this.model.find();
        res.json(data);
      }
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred while trying to fetch data",
      });
    }
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = await this.model.findById(id);
      if (!data) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: `Data with id: ${id} was not found` });
      } else {
        return res.json(data);
      }
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async post(req: AuthRequest, res: Response) {
    const obj = req.body;
    assertExists(req.user, "User information is missing in the request");
    obj.sender = req.user._id;
    try {
      const response = await this.model.create(obj);
      res.status(httpStatus.CREATED).json(response);
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    const id = req.params.id;
    assertExists(req.user, "User information is missing in the request");
    try {
      const doc = await this.model.findById(id);

      if (!doc) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: `Data with id: ${id} was not found` });
      }
      if (doc.sender.toString() !== req.user._id) {
        return res
          .status(httpStatus.FORBIDDEN)
          .json({ error: "Not authorized to delete this resource" });
      }
      const response = await this.model.findByIdAndDelete(id);
      return res.send(response);
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async put(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const obj = req.body;
    assertExists(req.user, "User information is missing in the request");
    try {
      const existing = await this.model.findById(id);
      if (!existing) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: `Data with id: ${id} was not found` });
      }
      if (existing.sender.toString() !== req.user._id) {
        return res
          .status(httpStatus.FORBIDDEN)
          .json({ error: "Not authorized to edit this resource" });
      }

      obj.sender = existing.sender;
      const response = await this.model.findByIdAndUpdate(id, obj, {
        new: true,
      });
      return res.json(response);
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
}
export default BaseController;
