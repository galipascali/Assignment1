import { Express } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../src/index";
import postsModel from "../src/models/postsModel";
import { postsData } from "./mockData";

let app: Express;

beforeAll(async () => {
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assignment1_test";
  app = await initApp();
  await postsModel.deleteMany({});
});

afterAll(async () => {
  try {
    await mongoose.connection.db?.dropDatabase();
  } catch (e) {
    console.error(`Error dropping database: ${e}`);
  } finally {
    await mongoose.connection.close();
  }
});

describe("Posts E2E", () => {
  test("GET /posts returns empty array on fresh DB", async () => {
    const res = await request(app).get("/posts");
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body).toEqual([]);
  });

  test("POST /posts creates posts", async () => {
    for (const p of postsData) {
      const res = await request(app).post("/posts").send(p);
      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body).toMatchObject(p);
      p._id = res.body._id;
    }
  });

  test("GET /posts returns posted items", async () => {
    const res = await request(app).get("/posts");
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(postsData.length);
    expect(res.body[0]).toMatchObject(postsData[0]!);
    expect(res.body[1]).toMatchObject(postsData[1]!);
  });

  test("GET /posts with filter", async () => {
    const res = await request(app)
      .get("/posts")
      .query({ sender: postsData[0]!.sender });
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(1);
    expect(res.body[0].sender).toBe(postsData[0]!.sender);
  });

  test("GET /posts with unexistent sender", async () => {
    const res = await request(app)
      .get("/posts")
      .query({ sender: "Unexistent Sender" });
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(0);
  });

  test("GET /posts/:id returns a post", async () => {
    const id = postsData[0]!._id;
    const res = await request(app).get(`/posts/${id}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(id);
  });

  test("PUT /posts/:id updates a post", async () => {
    const id = postsData[0]!._id;
    const updated = { ...postsData[0], message: "Updated" };
    const res = await request(app).put(`/posts/${id}`).send(updated);
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.message).toBe("Updated");
  });
});
