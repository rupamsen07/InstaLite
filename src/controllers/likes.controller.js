const likesService = require("../services/likes.service");

function parseId(value) {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

async function create(req, res, next) {
  if (!Object.hasOwn(req.body || {}, "userId")) {
    return res.status(400).json({ error: "userId is required" });
  }
  const postId = parseId(req.params.id);
  if (postId === null) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    if (!(await likesService.postExists(postId))) {
      return res.status(404).json({ error: "Post not found" });
    }
    const userId = parseId(req.body.userId);
    if (userId === null) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!(await likesService.userExists(userId))) {
      return res.status(404).json({ error: "User not found" });
    }

    const like = await likesService.createLike(userId, postId);
    return res.status(201).json(like);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }
    return next(error);
  }
}

async function remove(req, res, next) {
  const postId = parseId(req.params.id);
  if (postId === null) {
    return res.status(404).json({ error: "Like not found" });
  }
  const userId = parseId(req.params.userId);
  if (userId === null) {
    return res.status(404).json({ error: "Like not found" });
  }

  try {
    const deleted = await likesService.deleteLike(userId, postId);
    if (!deleted) {
      return res.status(404).json({ error: "Like not found" });
    }
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, remove };
