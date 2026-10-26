const express = require("express");
const usersController = require("../controllers/users.controller");

const router = express.Router();

router.post("/", usersController.create);
router.get("/", usersController.list);
router.get("/:id/posts", usersController.listPosts);
router.get("/:id/liked-posts", usersController.listLikedPosts);
router.get("/:id", usersController.getOne);
router.patch("/:id", usersController.update);
router.delete("/:id", usersController.remove);

module.exports = router;
