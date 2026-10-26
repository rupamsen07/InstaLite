const postsService = require("../services/posts.service");

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

async function create(req, res, next) {
  const { imageUrl, caption, location } = req.body || {};
  if (typeof imageUrl !== "string" || !imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    const post = await postsService.createPost({
      imageUrl,
      ...(caption !== undefined ? { caption } : {}),
      ...(location !== undefined ? { location } : {}),
    });
    return res.status(201).json(post);
  } catch (error) {
    return next(error);
  }
}

async function list(_req, res, next) {
  try {
    return res.status(200).json(await postsService.listPosts());
  } catch (error) {
    return next(error);
  }
}

async function getOne(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await postsService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(post);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: "Post not found" });
  }

  const data = {};
  for (const field of ["caption", "location"]) {
    if (Object.hasOwn(req.body || {}, field)) {
      data[field] = req.body[field];
    }
  }

  try {
    const post = await postsService.updatePost(id, data);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(post);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const deleted = await postsService.deletePost(id);
    if (!deleted) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list, getOne, update, remove };
