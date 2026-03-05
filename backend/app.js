const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoute");
const postRoutes = require("./routes/postRoute");
const commentRoutes = require("./routes/commentRoute");
const userRoutes = require("./routes/userRoute");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({
    origin: ["http://localhost:5173","https://anonify-v2.vercel.app"],
    credentials: true,
  }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/users", userRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;