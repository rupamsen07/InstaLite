const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function seed() {
  try {
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const createdUsers = await prisma.user.createManyAndReturn({
      data: users.map((user) => ({
        ...user,
        createdAt: new Date(user.createdAt),
      })),
    });

    const userIds = new Map(
      createdUsers.map((user) => [user.username, user.id]),
    );

    const createdPosts = await prisma.post.createManyAndReturn({
      data: posts.map(({ author, ...post }) => {
        const authorId = userIds.get(author);
        if (authorId === undefined) {
          throw new Error(`Unknown post author: ${author}`);
        }

        return {
          ...post,
          authorId,
          createdAt: new Date(post.createdAt),
        };
      }),
    });

    const postIds = new Map(
      createdPosts.map((post) => [
        post.imageUrl.split("/")[4],
        post.id,
      ]),
    );
    const likeRows = likes.map(({ user, post }) => {
      const userId = userIds.get(user);
      const postId = postIds.get(post);
      if (userId === undefined) {
        throw new Error(`Unknown user in like data: ${user}`);
      }
      if (postId === undefined) {
        throw new Error(`Unknown post in like data: ${post}`);
      }
      return { userId, postId };
    });
    const createdLikes = await prisma.like.createMany({ data: likeRows });

    console.log(
      `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`,
    );
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    }
  }
}

seed();
