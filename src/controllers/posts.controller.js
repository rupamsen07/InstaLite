const postsService = require("../services/posts.service");
const {
  parsePagination,
  parseSort,
  createMeta,
} = require("../utils/pagination");

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

function parseDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10) === value ? date : null;
}

async function list(req, res, next) {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const sorting = parseSort(
    req.query,
    ["createdAt", "updatedAt"],
    "sortBy must be one of: createdAt, updatedAt",
  );
  if (sorting.error) {
    return res.status(400).json({ error: sorting.error });
  }

  const where = {};
  if (req.query.location !== undefined) {
    if (typeof req.query.location !== "string") {
      return res.status(400).json({ error: "location must be a string" });
    }
    where.location = {
      equals: req.query.location,
      mode: "insensitive",
    };
  }
  if (req.query.search !== undefined) {
    if (typeof req.query.search !== "string") {
      return res.status(400).json({ error: "search must be a string" });
    }
    where.caption = {
      contains: req.query.search,
      mode: "insensitive",
    };
  }

  const from = req.query.from === undefined ? undefined : parseDate(req.query.from);
  const to = req.query.to === undefined ? undefined : parseDate(req.query.to);
  if (
    (req.query.from !== undefined && from === null) ||
    (req.query.to !== undefined && to === null)
  ) {
    return res.status(400).json({ error: "from and to must be valid dates" });
  }
  if (from !== undefined || to !== undefined) {
    where.createdAt = {
      ...(from !== undefined ? { gte: from } : {}),
      ...(to !== undefined ? { lt: to } : {}),
    };
  }

  try {
    const result = await postsService.listPosts({
      ...pagination,
      ...sorting,
      where,
    });
    return res.status(200).json({
      data: result.data,
      meta: createMeta(pagination.page, pagination.limit, result.total),
    });
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
