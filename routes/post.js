const router = require("express").Router();
const postController = require("../controllers/postController");
const { verifyToken } = require("../middlewares/auth");

router.get("/", verifyToken, postController.getAllPosts);

module.exports = router;
