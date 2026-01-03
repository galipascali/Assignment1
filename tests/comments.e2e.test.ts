import { Express } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../src/index";
import commentsModel from "../src/models/commentsModel";
import postsModel from "../src/models/postsModel";

import { commentsData, postsData } from "./mockData";
import { registerTestUser } from "./testUtils";

let app: Express;
let authHeader: string;

beforeAll(async () => {
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assignment1_test";
  app = await initApp();
  await postsModel.deleteMany({});
  await commentsModel.deleteMany({});

  const testUser = await registerTestUser(app);
  authHeader = `Bearer ${testUser.token}`;
  postsData.forEach((post) => (post.sender = testUser._id));
  const posts = await postsModel.create(postsData);

  expect(posts.length).toBe(2);
  commentsData[0]!.postId = String(posts[0]!._id);
  commentsData[1]!.postId = String(posts[0]!._id);
  commentsData[2]!.postId = String(posts[1]!._id);
  commentsData[0]!.sender = testUser._id;
  commentsData[1]!.sender = testUser._id;
  commentsData[2]!.sender = testUser._id;
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

describe("Comments E2E", () => {
  test("GET /comments returns empty array on fresh DB", async () => {
    const res = await request(app)
      .get("/comments")
      .set("Authorization", authHeader);

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body).toEqual([]);
  });

  test("POST /comments creates comments", async () => {
    for (const c of commentsData) {
      const res = await request(app)
        .post("/comments")
        .set("Authorization", authHeader)
        .send(c);
      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body).toMatchObject({ text: c.text, sender: c.sender });
      c._id = res.body._id;
    }
  });

  test("GET /comments returns posted items", async () => {
    const res = await request(app)
      .get("/comments")
      .set("Authorization", authHeader);
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(commentsData.length);
  });

  test("GET /comments with filter by postId", async () => {
    const post1Id = commentsData[0]!.postId;
    const res = await request(app)
      .get("/comments")
      .set("Authorization", authHeader)
      .query({ postId: post1Id });
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(2);

    const post2Id = commentsData[2]!.postId;
    const res2 = await request(app)
      .get("/comments")
      .set("Authorization", authHeader)
      .query({ postId: post2Id });
    expect(res2.status).toBe(httpStatus.OK);
    expect(res2.body.length).toBe(1);
  });

  test("PUT /comments/:id updates a comment", async () => {
    const id = commentsData[2]!._id;
    const updated = {
      ...commentsData[2],
      text: "updated text",
    };
    const res = await request(app)
      .put(`/comments/${id}`)
      .set("Authorization", authHeader)
      .send(updated);
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.text).toBe("updated text");
  });

  test("DELETE /comments/:id deletes a comment", async () => {
    const id = commentsData[2]!._id;
    const res = await request(app)
      .delete(`/comments/${id}`)
      .set("Authorization", authHeader);
    expect(res.status).toBe(httpStatus.OK);

    const getRes = await request(app)
      .get(`/comments/${id}`)
      .set("Authorization", authHeader);
    expect(getRes.status).toBe(httpStatus.NOT_FOUND);
  });

  describe("Sad Path", () => {
    test("PUT /comments/:id by non-owner returns 403", async () => {
      const other = await registerTestUser(app, {
        name: "Other User",
        email: "other2@example.com",
        password: "password",
      });
      const otherAuth = `Bearer ${other.token}`;

      const id = commentsData[0]!._id;
      const res = await request(app)
        .put(`/comments/${id}`)
        .set("Authorization", otherAuth)
        .send({ text: "Not allowed" });
      expect(res.status).toBe(httpStatus.FORBIDDEN);
    });

    test("DELETE /comments/:id by non-owner returns 403", async () => {
      const otherLogin = await registerTestUser(app, {
        email: "other2@example.com",
        password: "password",
        name: "other",
      });
      const otherAuth = `Bearer ${otherLogin.token}`;

      const id = commentsData[1]!._id;
      const res = await request(app)
        .delete(`/comments/${id}`)
        .set("Authorization", otherAuth);
      expect(res.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});
