import { Express } from "express";
import request from "supertest";
import User from "../src/models/userModel";
import { UserData } from "./mockData";

export const defaultUserData: UserData = {
  email: "test@user.com",
  password: "testpassword",
  name: "Test User",
};

export const registerTestUser = async (
  app: Express,
  userData?: UserData
): Promise<UserData> => {
  await User.deleteMany({ email: userData?.email ?? defaultUserData.email });
  const email = userData?.email ?? defaultUserData.email;
  const password = userData?.password ?? defaultUserData.password;
  const name = userData?.name ?? defaultUserData.name;
  const res = await request(app).post("/auth/register").send({
    email,
    password,
    name,
  });

  return {
    email,
    name,
    password,
    _id: res.body.user.id,
    token: res.body.accessToken,
  };
};
