const prisma = require("../src/db");
const { users, posts } = require("./seed-data");

async function seed() {
  try {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const createdUsers = await prisma.user.createMany({
      data: users.map((user) => ({
        ...user,
        createdAt: new Date(user.createdAt),
      })),
    });
    const createdPosts = await prisma.post.createMany({
      data: posts.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      })),
    });

    console.log(
      `🌱 Seeded ${createdUsers.count} users and ${createdPosts.count} posts`,
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
