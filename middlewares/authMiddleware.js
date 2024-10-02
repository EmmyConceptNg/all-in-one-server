const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRole) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
          return res.status(401).json({ message: "Invalid token payload" });
        }

        req.userId = decoded.userId;
        req.userRole = decoded.role; 

        if (requiredRole && decoded.role !== requiredRole) {
          return res.status(403).json({ message: "You do not have the required permissions" });
        }

        next();
      } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    } else {
      return res.status(401).json({ message: "Authorization token is required" });
    }
  };
};

module.exports = authMiddleware;
