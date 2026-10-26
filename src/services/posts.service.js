const prisma = require("../db");

function createPost(data) {
  return prisma.post.create({ data });
}

function listPosts({ page, limit, skip, sortBy, order, where }) {
  return prisma
    .$transaction([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.post.count({ where }),
    ])
    .then(([data, total]) => ({ data, total, page, limit }));
}

function getPostById(id) {
  return prisma.post.findUnique({ where: { id } });
}

async function updatePost(id, data) {
  const result = await prisma.post.updateMany({ where: { id }, data });
  if (result.count === 0) {
    return null;
  }
  return getPostById(id);
}

async function deletePost(id) {
  const result = await prisma.post.deleteMany({ where: { id } });
  return result.count > 0;
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
