import bcrypt from "bcrypt";
import { Request, Response } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { JwtTokenPayload } from "../types/jwtPayload";

const JWT_SECRET = process.env.JWT_SECRET || "secret_for_tests";
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES_IN || "7d";

const refresExpiresInMs = !isNaN(Number(REFRESH_EXPIRES))
  ? Number(REFRESH_EXPIRES)
  : 15 * 60 * 1000; // default 15 minutes
const accessExpiresInMs = !isNaN(Number(ACCESS_EXPIRES))
  ? Number(ACCESS_EXPIRES)
  : 24 * 60 * 60 * 1000; // default 24 hours

function signAccess(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: accessExpiresInMs,
  });
}

function signRefresh(userId: string) {
  // include a small nonce so tokens issued in the same second are different
  return jwt.sign({ userId, nonce: Date.now() }, JWT_SECRET, {
    expiresIn: refresExpiresInMs,
  });
}

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "Missing required fields" });
    }
    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(httpStatus.CONFLICT)
        .json({ error: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: encryptedPassword,
    });
    const refresh = signRefresh(user._id.toString());
    user.refreshToken.push(refresh);
    await user.save();

    const access = signAccess(user._id.toString());
    return res.status(httpStatus.CREATED).json({
      user: { id: user._id, email: user.email },
      accessToken: access,
      refreshToken: refresh,
    });
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "Missing required fields" });
    }
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Invalid credentials" });

    const access = signAccess(user._id.toString());
    const refresh = signRefresh(user._id.toString());
    user.refreshToken.push(refresh);
    await user.save();

    return res.json({ accessToken: access, refreshToken: refresh });
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ error: "refreshToken required" });
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const parsedPayload = JwtTokenPayload.parse(payload);
    const userId = parsedPayload.userId;
    const user = await User.findById(userId);

    if (!user)
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Invalid token" });

    if (!user.refreshToken.includes(refreshToken)) {
      user.refreshToken = [];
      await user.save();
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Invalid token" });
    }

    const newRefresh = signRefresh(userId);
    user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
    user.refreshToken.push(newRefresh);
    await user.save();

    const access = signAccess(userId);
    return res.json({ accessToken: access, refreshToken: newRefresh });
  } catch (err) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: "Invalid token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: "refreshToken required" });
  try {
    const payload = jwt.decode(refreshToken);
    const parsedPayload = JwtTokenPayload.parse(payload);
    const userId = parsedPayload.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(httpStatus.OK).json({});
    user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
    await user.save();
    return res.status(httpStatus.OK).json({});
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
  }
};
