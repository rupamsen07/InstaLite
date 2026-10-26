const prisma = require("../db");

function createUser(data) {
  return prisma.user.create({ data });
}

function listUsers({ page, limit, skip, sortBy, order, where }) {
  return prisma
    .$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.user.count({ where }),
    ])
    .then(([data, total]) => ({ data, total, page, limit }));
}

function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function updateUser(id, data) {
  const result = await prisma.user.updateMany({ where: { id }, data });
  if (result.count === 0) {
    return null;
  }
  return getUserById(id);
}

async function deleteUser(id) {
  const result = await prisma.user.deleteMany({ where: { id } });
  return result.count > 0;
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
