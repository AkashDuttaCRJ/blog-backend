const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  id: String,
  title: String,
  content: String,
  author_id: String,
  is_draft: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = postSchema;
