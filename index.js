const express = require("express");
const app = express();
const mongoose = require("mongoose");

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
