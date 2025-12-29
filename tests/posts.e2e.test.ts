import { Express } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../src/index";
import postsModel from "../src/models/postsModel";
import { postsData, UserData } from "./mockData";
import { registerTestUser } from "./testUtils";

let app: Express;
let authHeader: string;
let testUser: UserData;

beforeAll(async () => {
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assignment1_test";
  app = await initApp();
  await postsModel.deleteMany({});
  testUser = await registerTestUser(app);
  authHeader = `Bearer ${testUser.token}`;
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
    const res = await request(app)
      .get("/posts")
      .set("Authorization", authHeader);
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body).toEqual([]);
  });

  test("POST /posts creates posts", async () => {
    for (const p of postsData) {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ message: p.message });
      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body.message).toBe(p.message);
      expect(res.body.sender).toBe(testUser!._id);
      p._id = res.body._id;
      p.sender = res.body.sender;
    }
  });

  test("GET /posts returns posted items", async () => {
    const res = await request(app)
      .get("/posts")
      .set("Authorization", authHeader);
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(postsData.length);
    expect(res.body[0]).toMatchObject(postsData[0]!);
    expect(res.body[1]).toMatchObject(postsData[1]!);
  });

  test("PUT /posts/:id by non-owner returns 403", async () => {
    const other = await request(app).post("/auth/register").send({
      name: "Other User",
      email: "other@example.com",
      password: "password",
    });
    const otherAuth = `Bearer ${other.body.accessToken}`;

    const id = postsData[0]!._id;
    const res = await request(app)
      .put(`/posts/${id}`)
      .set("Authorization", otherAuth)
      .send({ message: "Malicious update" });
    expect(res.status).toBe(httpStatus.FORBIDDEN);
  });

  test("GET /posts with filter", async () => {
    const res = await request(app)
      .get("/posts")
      .set("Authorization", authHeader)
      .query({ sender: postsData[0]!.sender });
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toMatchObject(postsData[0]!);
  });

  test("GET /posts with unexistent sender", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get("/posts")
      .set("Authorization", authHeader)
      .query({ sender: fakeId });
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.length).toBe(0);
  });

  test("GET /posts/:id returns a post", async () => {
    const id = postsData[0]!._id;
    const res = await request(app)
      .get(`/posts/${id}`)
      .set("Authorization", authHeader);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(id);
  });

  test("PUT /posts/:id updates a post", async () => {
    const id = postsData[0]!._id;
    const updated = { ...postsData[0], message: "Updated" };
    const res = await request(app)
      .put(`/posts/${id}`)
      .set("Authorization", authHeader)
      .send(updated);
    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.message).toBe("Updated");
  });
});
