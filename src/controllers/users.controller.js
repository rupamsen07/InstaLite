const usersService = require("../services/users.service");

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

async function list(_req, res, next) {
  try {
    return res.status(200).json(await usersService.listUsers());
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

module.exports = { create, list, getOne, update, remove };
