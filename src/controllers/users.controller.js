const usersService = require("../services/users.service");
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
  const { username, email, fullname, bio } = req.body || {};
  if (
    typeof username !== "string" ||
    !username ||
    typeof email !== "string" ||
    !email ||
    typeof fullname !== "string" ||
    !fullname
  ) {
    return res
      .status(400)
      .json({ error: "username, email and fullname are required" });
  }

  try {
    const user = await usersService.createUser({
      username,
      email,
      fullname,
      ...(bio !== undefined ? { bio } : {}),
    });
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "username or email already taken" });
    }
    return next(error);
  }
}

async function list(req, res, next) {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const sorting = parseSort(
    req.query,
    ["createdAt", "username", "fullname"],
    "sortBy must be one of: createdAt, username, fullname",
  );
  if (sorting.error) {
    return res.status(400).json({ error: sorting.error });
  }

  let isPrivate;
  if (req.query.isPrivate !== undefined) {
    if (req.query.isPrivate !== "true" && req.query.isPrivate !== "false") {
      return res
        .status(400)
        .json({ error: "isPrivate must be true or false" });
    }
    isPrivate = req.query.isPrivate === "true";
  }

  const where = {};
  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }
  if (req.query.search !== undefined) {
    if (typeof req.query.search !== "string") {
      return res.status(400).json({ error: "search must be a string" });
    }
    where.OR = [
      { username: { contains: req.query.search, mode: "insensitive" } },
      { fullname: { contains: req.query.search, mode: "insensitive" } },
    ];
  }
  if (req.query.hasPosts !== undefined) {
    if (req.query.hasPosts !== "true" && req.query.hasPosts !== "false") {
      return res.status(400).json({ error: "hasPosts must be true or false" });
    }
    where.posts = req.query.hasPosts === "true" ? { some: {} } : { none: {} };
  }

  try {
    const result = await usersService.listUsers({
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
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const user = await usersService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

async function listPosts(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await usersService.listUserPosts(id, pagination);
    if (result === null) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({
      data: result.data,
      meta: createMeta(pagination.page, pagination.limit, result.total),
    });
  } catch (error) {
    return next(error);
  }
}

async function listLikedPosts(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await usersService.listLikedPosts(id, pagination);
    if (result === null) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({
      data: result.data,
      meta: createMeta(pagination.page, pagination.limit, result.total),
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: "User not found" });
  }

  const data = {};
  for (const field of ["fullname", "bio", "isPrivate"]) {
    if (Object.hasOwn(req.body || {}, field)) {
      data[field] = req.body[field];
    }
  }

  try {
    const user = await usersService.updateUser(id, data);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const deleted = await usersService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
  getOne,
  listPosts,
  listLikedPosts,
  update,
  remove,
};
