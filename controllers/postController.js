const Post = require("../models/post");
const { v4: uuidv4 } = require("uuid");

const getAllPosts = async (req, res) => {
  try {
    // get all posts where is_active is true, and is_draft is false (order by latest)
    const posts = await Post.find({ is_active: true, is_draft: false })
      .sort({ created_at: -1 })
      .exec();
    res.json(posts);
  } catch (error) {
    res.json({ message: error.message });
  }
};

module.exports = {
  getAllPosts,
};
