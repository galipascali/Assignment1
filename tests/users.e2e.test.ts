import { Express } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import request from "supertest";
import initApp from "../src/index";
import User from "../src/models/userModel";

import { registerTestUser } from "./testUtils";

let app: Express;

beforeAll(async () => {
    app = await initApp();
    await User.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Users E2E", () => {
    let accessToken: string;
    let userId: string;

    test("Register a new user", async () => {
        const user = await registerTestUser(app);
        accessToken = user.token!;
        userId = user._id!;
        expect(accessToken).toBeDefined();
        expect(userId).toBeDefined();
    });

    test("Get all users", async () => {
        const response = await request(app)
            .get("/users")
            .set("Authorization", "Bearer " + accessToken);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("Get user by ID", async () => {
        const response = await request(app)
            .get(`/users/${userId}`)
            .set("Authorization", "Bearer " + accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Test User");
        expect(response.body.email).toBe("test@user.com");
        expect(response.body.password).toBeUndefined();
    });

    test("Update user", async () => {
        const newName = "Updated Name";
        const response = await request(app)
            .put(`/users/${userId}`)
            .set("Authorization", "Bearer " + accessToken)
            .send({ name: newName });
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe(newName);
    });

    test("Update user - Forbidden (different user)", async () => {
        const otherUser = await request(app).post("/auth/register").send({
            name: "Other User",
            email: "other@user.com",
            password: "password123"
        });
        const otherAccessToken = otherUser.body.accessToken;

        const response = await request(app)
            .put(`/users/${userId}`)
            .set("Authorization", "Bearer " + otherAccessToken)
            .send({ name: "Hacked Name" });

        expect(response.statusCode).toBe(httpStatus.FORBIDDEN);
    });

    test("Delete user - Forbidden (different user)", async () => {
        const otherUser = await request(app).post("/auth/register").send({
            name: "Other User",
            email: "other1@user.com",
            password: "password123"
        });
        const otherAccessToken = otherUser.body.accessToken;

        const checkResponse = await request(app)
            .delete(`/users/${userId}`)
            .set("Authorization", "Bearer " + otherAccessToken)
            .send();

        expect(checkResponse.statusCode).toBe(httpStatus.FORBIDDEN);
    });
    test("Delete user", async () => {
        const response = await request(app)
            .delete(`/users/${userId}`)
            .set("Authorization", "Bearer " + accessToken)
            .send();
        expect(response.statusCode).toBe(httpStatus.OK);
    });
});
