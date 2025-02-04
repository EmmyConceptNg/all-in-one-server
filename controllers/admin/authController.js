const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, name: user.firstName, role: user.role },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      token,
      email: user.email,
      role: user.role,
      id: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};


exports.register = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    let user = await Admin.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      user = new Admin({
        firstName,
        lastName,
        email,
        password: hashedPassword, // Store hashed password
        role: "admin",
      });

      await user.save();

      res.status(200).json({ msg: "Registration successful." });
    } catch (error) {
      res
        .status(500)
        .json({ msg: "Failed to create user. Please try again", error });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
