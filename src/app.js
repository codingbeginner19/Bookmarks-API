require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");

const logger = require("./logger");
const bookmarksRouter = require("./bookmarks-router");

const app = express();

app.use(morgan(NODE_ENV === "production" ? "tiny" : "common"));
app.use(helmet());
app.use(cors());

app.use(function (req, res, next) {
  const authToken = req.get("Authorization");
  logger.error(`Unauthorized request to path: ${req.path}`);

  if (!authToken || authToken.split(" ")[1] !== API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  next();
});

app.use(bookmarksRouter);

app.use(function (error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    logger.error(error.message);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
销;
