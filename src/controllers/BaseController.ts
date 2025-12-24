import { Request, Response } from "express";

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
      res.status(500).json({
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
          .status(404)
          .json({ error: `Data with id: ${id} was not found` });
      } else {
        return res.json(data);
      }
    } catch (error) {
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async post(req: Request, res: Response) {
    const obj = req.body;
    try {
      const response = await this.model.create(obj);
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const response = await this.model.findByIdAndDelete(id);
      res.send(response);
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async put(req: Request, res: Response) {
    const id = req.params.id;
    const obj = req.body;
    try {
      const response = await this.model.findByIdAndUpdate(id, obj, {
        new: true,
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
}
export default BaseController;
