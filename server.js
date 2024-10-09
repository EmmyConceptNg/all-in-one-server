const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const authMiddleware = require('./middlewares/authMiddleware');
const scheduleRoutes = require('./routes/scheduleRoutes');
const projectRoutes = require('./routes/projectRoutes');
const accountingRoutes = require('./routes/accountingRoutes');
const employeeRoutes = require('./routes/employee');
const workspaceRoutes = require('./routes/workspaceRoutes');
const timeTrackerRoutes = require('./routes/timeTrackerRoutes');
const contractRoutes = require('./routes/contractRoutes');
const uploadRoutes = require("./routes/uploads");


require("dotenv").config();

const app = express();

connectDB();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
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

app.use("/api/auth", authRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/time-tracker', timeTrackerRoutes);
app.use('/api/contracts', contractRoutes);
app.use("/api/uploads", uploadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
