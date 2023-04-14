const mongoose = require("mongoose");
const tokenSchema = require("../schemas/tokenSchema");

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
