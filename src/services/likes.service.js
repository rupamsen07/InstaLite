const prisma = require("../db");

function postExists(postId) {
  return prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
}

function userExists(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
}

function createLike(userId, postId) {
  return prisma.like.create({
    data: { userId, postId },
  });
}

async function deleteLike(userId, postId) {
  try {
    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });
    return true;
  } catch (error) {
    if (error.code === "P2025") {
      return false;
    }
    throw error;
  }
}

module.exports = { postExists, userExists, createLike, deleteLike };
