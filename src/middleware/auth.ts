import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtTokenPayload } from "../types/jwtPayload";
import { assertExists } from "../utils";

export type AuthRequest = Request & { user?: { _id: string } };

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  assertExists(token, "Token not found");
  const secret: string = process.env.JWT_SECRET || "secret_for_tests";

  try {
    const decoded = jwt.verify(token, secret);
    const paesedPayload = JwtTokenPayload.safeParse(decoded);

    if (!paesedPayload.success) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = paesedPayload.data.userId;
    req.user = { _id: userId };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export default authMiddleware;
