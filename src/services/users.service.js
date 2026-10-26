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
  return prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { posts: true, likes: true } },
    },
  });
}

async function listUserPosts(id, { page, limit, skip }) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!user) {
    return null;
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: { authorId: id },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { likes: true } } },
    }),
    prisma.post.count({ where: { authorId: id } }),
  ]);

  return { data, total, page, limit };
}

async function listLikedPosts(id, { page, limit, skip }) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!user) {
    return null;
  }

  const where = { likes: { some: { userId: id } } };
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, username: true, fullname: true },
        },
        _count: { select: { likes: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total, page, limit };
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
  listUserPosts,
  listLikedPosts,
  updateUser,
  deleteUser,
};
