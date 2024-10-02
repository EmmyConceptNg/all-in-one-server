const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("Decoded Code:", decoded);

      if (!decoded.userId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    return res.status(401).json({ message: "Authorization token is required" });
  }
};

module.exports = authMiddleware;
