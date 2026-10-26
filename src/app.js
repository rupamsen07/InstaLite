const express = require("express");
const usersRouter = require("./routes/users.routes");
const postsRouter = require("./routes/posts.routes");

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
