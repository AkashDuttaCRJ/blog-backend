const Auth = require("../models/auth");
const Token = require("../models/token");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Missing field "Username"' });
  } else if (!password) {
    return res.status(400).json({ message: 'Missing field "Password"' });
  }
  try {
    let user = await Auth.find({ $or: [{ username }, { email: username }] });
    if (!user || user.length === 0) {
      return res.status(400).json({ message: "User does not exist" });
    }
    user = user[0];
    bcrypt.compare(password, user.password, (err) => {
      if (err) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    });
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const refresh_token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "30d",
      }
    );
    const isUserExists = await Token.find({ user_id: user.id });
    if (isUserExists.length > 0) {
      await Token.updateOne(
        { user_id: user.id },
        {
          token: refresh_token,
          updated_at: Date.now(),
        }
      );
    } else {
      const newToken = new Token({
        id: uuidv4(),
        token: refresh_token,
        user_id: user.id,
      });
      await newToken.save();
    }
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        created_at: user.created_at,
      },
      token,
      refresh_token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  const { username, email, password, confirm_password } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Missing field "Username"' });
  } else if (!email) {
    return res.status(400).json({ message: 'Missing field "Email"' });
  } else if (!password) {
    return res.status(400).json({ message: 'Missing field "Password"' });
  } else if (!confirm_password) {
    return res
      .status(400)
      .json({ message: 'Missing field "Confirm Password"' });
  } else if (password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  try {
    const isUserExists = await Auth.find({
      $or: [{ username }, { email }],
    });
    if (isUserExists.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Auth({
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    console.log(user);
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const refresh_token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "30d",
      }
    );
    const tokenModel = new Token({
      id: uuidv4(),
      token: refresh_token,
      user_id: user.id,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    await user.save();
    await tokenModel.save();
    return res.status(201).json({
      message: "User created",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        created_at: user.created_at,
      },
      token,
      refresh_token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ message: "Missing field 'user_id'" });
  }
  try {
    const token = await Token.find({ user_id });
    if (token.length !== 0) {
      await Token.findOneAndDelete({ user_id });
    }
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  logoutUser,
};
