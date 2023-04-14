const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  id: String,
  token: String,
  user_id: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = tokenSchema;
