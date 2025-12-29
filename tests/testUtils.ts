import { Express } from "express";
import request from "supertest";
import User from "../src/models/userModel";
import { UserData } from "./mockData";

export const userData: UserData = {
  email: "test@testMovies.com",
  password: "testpasswordMovies",
  name: "Test User",
};

export const registerTestUser = async (app: Express): Promise<UserData> => {
  await User.deleteMany({ email: userData.email });

  const res = await request(app).post("/auth/register").send({
    email: userData.email,
    password: userData.password,
    name: userData.name,
  });
  userData._id = res.body.user.id;
  userData.token = res.body.accessToken;

  return userData;
};
