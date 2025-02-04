const express = require("express");
const { json } = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/auth.js");
const authMiddleware = require("./middlewares/authMiddleware.js");
const scheduleRoutes = require("./routes/scheduleRoutes.js");
const projectRoutes = require("./routes/projectRoutes.js");
const employeeRoutes = require("./routes/employee.js");
const workspaceRoutes = require("./routes/workspaceRoutes.js");
const timeTrackerRoutes = require("./routes/timeTrackerRoutes.js");
const contractRoutes = require("./routes/contractRoutes.js");
const templateRoutes = require("./routes/templateRoutes.js");
const superAdminRoutes = require("./routes/superAdminRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes");
const shiftRoutes = require("./routes/shiftRoutes");

const path = require("path");

const dotenv = require("dotenv");
dotenv.config();

const app = express();

connectDB();

app.use(json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://almedin-project.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/time-tracker", timeTrackerRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/super_admin", superAdminRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/shift", shiftRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
