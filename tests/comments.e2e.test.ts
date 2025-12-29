import { Express } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../src/index";
import commentsModel from "../src/models/commentsModel";
import postsModel from "../src/models/postsModel";

import { commentsData, postsData } from "./mockData";
import userModel from "../src/models/userModel";

let app: Express;

beforeAll(async () => {
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assignment1_test";
  app = await initApp();
  await postsModel.deleteMany({});
  await commentsModel.deleteMany({});

  const user = await userModel.create({
    name: "Test User",
    email: "test@example.com",
  });
  commentsData.forEach((c) => (c.sender = user._id.toString()));
  postsData.forEach((p) => (p.sender = user._id.toString()));

  const posts = await postsModel.create(postsData);

  expect(posts.length).toBe(2);
  commentsData[0]!.postId = String(posts[0]!._id);
  commentsData[1]!.postId = String(posts[0]!._id);
  commentsData[2]!.postId = String(posts[1]!._id);
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

describe("Comments E2E", () => {
  test("GET /comments returns empty array on fresh DB", async () => {
    const res = await request(app).get("/comments");
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body).toEqual([]);
  });

  test("POST /comments creates comments", async () => {
    for (const c of commentsData) {
      const res = await request(app).post("/comments").send(c);
      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body).toMatchObject({ text: c.text, sender: c.sender });
      c._id = res.body._id;
    }
  });

  test("GET /comments returns posted items", async () => {
    const res = await request(app).get("/comments");
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(commentsData.length);
  });

  test("GET /comments with filter by postId", async () => {
    const post1Id = commentsData[0]!.postId;
    const res = await request(app).get("/comments").query({ postId: post1Id });
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(2);

    const post2Id = commentsData[2]!.postId;
    const res2 = await request(app).get("/comments").query({ postId: post2Id });
    expect(res2.status).toBe(httpStatus.OK);
    expect(res2.body.length).toBe(1);
  });

  test("PUT /comments/:id updates a comment", async () => {
    const id = commentsData[2]!._id;
    const updated = {
      ...commentsData[2],
      text: "updated text",
    };
    const res = await request(app).put(`/comments/${id}`).send(updated);
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.text).toBe("updated text");
  });

  test("DELETE /comments/:id deletes a comment", async () => {
    const id = commentsData[2]!._id;
    const res = await request(app).delete(`/comments/${id}`);
    expect(res.status).toBe(httpStatus.OK);

    const getRes = await request(app).get(`/comments/${id}`);
    expect(getRes.status).toBe(httpStatus.NOT_FOUND);
  });
});
