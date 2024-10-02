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

      // Attach userId to the request object
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

// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     const token = req.headers.authorization?.split(' ')[1];

//     if (token) {
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             req.userId = decoded.id; // Attach userId to request
//             next();
//         } catch (error) {
//             return res.status(401).json({ message: 'Invalid or expired token' });
//         }
//     } else {
//         return res.status(401).json({ message: 'Authorization token is required' });
//     }
// };

// module.exports = authMiddleware;

// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authMiddleware = async (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ msg: 'No token provided' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await User.findById(decoded.userId).select('-password'); // Exclude password from the response
//         next();
//     } catch (error) {
//         res.status(401).json({ msg: 'Invalid token' });
//     }
// };

// module.exports = authMiddleware;
