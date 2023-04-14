const mongoose = require("mongoose");
const authSchema = require("../schemas/authSchema");

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
