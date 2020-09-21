const express = require("express");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");
const logger = require("./logger");
const bookmarksData = require("../data/bookmarks");

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(bookmarksData.bookmarks);
  })
  .post(bodyParser, (req, res) => {
    if (!req.body["title"]) {
      logger.error("title is required");
      return res.status(400).send("title is required");
    }
    if (!req.body["url"]) {
      logger.error("url is required");
      return res.status(400).send("url is required");
    }
    if (!req.body["rating"]) {
      logger.error("rating is required");
      return res.status(400).send("rating is required");
    }
    const { title, url, description, rating } = req.body;

    if (!Number.isInteger(rating) || rating > 5 || rating < 0) {
      logger.error(`Invalid rating '${rating}' supplied`);
      return res.status(400).send(`'rating' must be a number between 0 and 5`);
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`);
      return res.status(400).send(`'url' must be a valid URL`);
    }

    const bookmark = { id: uuid(), title, url, description, rating };

    bookmarksData.bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${bookmark.id} created`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route("/bookmarks/:bookmark_id")
  .get((req, res) => {
    const { bookmark_id } = req.params;

    const bookmark = bookmarksData.bookmarks.find((c) => c.id == bookmark_id);

    if (!bookmark) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }

    res.json(bookmark);
  })
  .delete((req, res) => {
    const { bookmark_id } = req.params;

    const bookmarkIndex = bookmarksData.bookmarks.findIndex(
      (b) => b.id === bookmark_id
    );

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }

    bookmarksData.bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${bookmark_id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarksRouter;
