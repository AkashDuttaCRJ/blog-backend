const Auth = require("../models/auth");
const Token = require("../models/token");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // get x-access-token from request header
  const user_id = req.headers["x-key"];
  const token = req.headers["x-access-token"];
  const refreshToken = req.headers["x-refresh-token"];
  // check if token is not empty
  if (!token) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  // verify token
  jwt.verify(token, process.env.JWT_SECRET, async (err) => {
    if (err) {
      // if token is expired
      if (err.name === "TokenExpiredError") {
        if (!refreshToken) {
          return res.status(403).json({ message: "Unauthorized" });
        }
        const tokenDetails = await Token.find({ user_id });
        if (tokenDetails.length === 0) {
          return res.status(403).json({ message: "Unauthorized" });
        } else if (tokenDetails[0].token !== refreshToken) {
          return res.status(403).json({ message: "Unauthorized" });
        }
        jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET,
          async (err) => {
            if (err) {
              return res.status(401).json({ message: "Invalid token" });
            }
            const userDetails = await Auth.find({ id: user_id });
            const newToken = jwt.sign(
              {
                id: userDetails[0].id,
                username: userDetails[0].username,
                email: userDetails[0].email,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "1h",
              }
            );
            res.setHeader("x-access-token", newToken);
          }
        );
      } else {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
    next();
  });
};

module.exports = {
  verifyToken,
};
