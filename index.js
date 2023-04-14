const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

const mongoose = require("mongoose");
require("dotenv").config();

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const cluster = process.env.DB_CLUSTER;
const database = process.env.DB_NAME;

mongoose.connect(
  `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.get("/keep-alive", (req, res) => {
  return res.status(200).json({ message: "Success" });
});

const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");

app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

const port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
