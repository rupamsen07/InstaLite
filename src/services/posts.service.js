const prisma = require("../db");

function createPost(data) {
  return prisma.post.create({ data });
}

function listPosts({ page, limit, skip, sortBy, order, where }) {
  const orderBy =
    sortBy === "likes"
      ? [{ likes: { _count: order } }, { createdAt: "desc" }]
      : [{ [sortBy]: order }];

  return prisma
    .$transaction([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: { id: true, username: true, fullname: true },
          },
          _count: { select: { likes: true } },
        },
      }),
      prisma.post.count({ where }),
    ])
    .then(([data, total]) => ({ data, total, page, limit }));
}

function getPostById(id) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, username: true, fullname: true },
      },
      _count: { select: { likes: true } },
    },
  });
}

async function listPostLikes(id) {
  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!post) {
    return null;
  }

  const likes = await prisma.like.findMany({
    where: { postId: id },
    orderBy: { user: { username: "asc" } },
    select: {
      user: {
        select: { id: true, username: true, fullname: true },
      },
    },
  });

  return likes.map(({ user }) => user);
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
  listPostLikes,
  updatePost,
  deletePost,
};
