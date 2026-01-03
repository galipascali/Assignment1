import { Express } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../src/index";
import userModel from "../src/models/userModel";

let app: Express;
const userCredentials = {
  email: "auth@example.com",
  password: "password",
};
beforeAll(async () => {
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assignment1_test";
  app = await initApp();
  await userModel.deleteMany({});
});

afterAll(async () => {
  try {
    await mongoose.connection.db?.dropDatabase();
  } catch (e) {
    console.error(`Error dropping database: ${JSON.stringify(e)}`);
  } finally {
    await mongoose.connection.close();
  }
});

describe("Auth E2E", () => {
  test("POST /auth/register returns accessToken and user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        name: "Auth User",
        ...userCredentials,
      });
    expect(res.status).toBe(httpStatus.CREATED);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user).toHaveProperty("id");
  });

  test("POST /auth/login with valid creds returns tokens", async () => {
    const res = await request(app).post("/auth/login").send(userCredentials);
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  test("POST /auth/login with invalid creds returns 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        ...userCredentials,
        password: "wrong",
      });
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  test("POST /auth/refresh rotates refresh token and invalidates used one", async () => {
    const login = await request(app).post("/auth/login").send(userCredentials);
    const firstRefresh = login.body.refreshToken;

    const r1 = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: firstRefresh });
    expect(r1.status).toBe(httpStatus.OK);
    expect(r1.body).toHaveProperty("accessToken");
    expect(r1.body).toHaveProperty("refreshToken");
    const rotated = r1.body.refreshToken;
    expect(rotated).not.toBe(firstRefresh);

    const reuse = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: firstRefresh });
    expect(reuse.status).toBe(httpStatus.UNAUTHORIZED);
  });

  test("POST /auth/logout removes refresh token", async () => {
    const login = await request(app).post("/auth/login").send(userCredentials);
    const refresh = login.body.refreshToken;

    const out = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: refresh });
    expect(out.status).toBe(httpStatus.OK);

    const after = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: refresh });
    expect(after.status).toBe(httpStatus.UNAUTHORIZED);
    const userFromDB = await userModel
      .findOne({
        email: userCredentials.email,
      })
      .exec();
    expect(userFromDB?.refreshToken).toBeDefined();
    expect(userFromDB?.refreshToken.length).toBe(0);
  });
});
