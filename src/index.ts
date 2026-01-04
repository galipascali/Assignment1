import { config } from "dotenv";
import express, { Express } from "express";
import mongoose from "mongoose";
import authRoute from "./routes/authRoute";
import commentsRoute from "./routes/commentsRoute";
import postsRoute from "./routes/postsRoute";
import { specs, swaggerUi } from "./swagger";

config();

const app = express();

const initApp = () => {
  const appPromise = new Promise<Express>((resolve, reject) => {
    app.use(express.json());

    app.use("/auth", authRoute);
    app.use("/posts", postsRoute);
    app.use("/comments", commentsRoute);

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Movie & Comments API Documentation"
    }));

    app.get("/api-docs.json", (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(specs);
    });


    const dbUri = process.env.MONGODB_URI;

    if (!dbUri) {
      console.error("MONGODB_URI is not defined in the environment variables.");
      reject(new Error("MONGODB_URI is not defined"));
    } else {
      mongoose.connect(dbUri).then(() => {
        resolve(app);
      });
    }
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("open", () => console.log("Connected to Database"));
  });

  return appPromise;
};

export default initApp;
