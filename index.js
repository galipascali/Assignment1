const express = require("express");
const app = express();
const mongoose = require("mongoose");

app.use(express.json());
const postsRoute = require("./routes/postsRoute");
const commentsRoute = require("./routes/commentsRoute");

app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);

const initApp = () => {
  const appPromise = new Promise((resolve) => {
    mongoose.connect(process.env.DATABASE_URL).then(() => {
      resolve(app);
    });
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("open", () => console.log("Connected to Database"));
  });
  return appPromise;
};

module.exports = initApp;
