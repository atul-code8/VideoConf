// Node.js server code

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const { createServer } = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const server = createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });
const pool = require("./db.js");
const authRoutes = require("./routes/authRoute.js");

const usersTableExists = async () => {
  const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'users'
    )
  `;
  const result = await pool.query(query);
  return result.rows[0].exists;
};

// Postgres connection
const createUserTable = async () => {
  if (await usersTableExists()) return;
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (email),
      UNIQUE (name)
    )`;
  await pool.query(query);
  console.log("User table created");
};

createUserTable();

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  }
  console.log("Connected to the database");
});

// Mock database
let users = [];
let meetings = [];

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes
app.use("/api", authRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

// Meeting Routes
app.post("/api/meetings", (req, res) => {
  const { title } = req.body;
  const meeting = {
    id: uuid(),
    title,
    participants: [],
    chat: [],
    createdAt: new Date(),
  };
  meetings.push(meeting);
  res.status(201).json(meeting);
});

// WebSocket Logic
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = user.userId;
    next();
  });
});

io.on("connection", (socket) => {
  socket.on("create-meeting", (meetingId, title) => {
    const meeting = {
      id: meetingId,
      title,
      createdAt: new Date(),
    };
    meetings.push(meeting);
    socket.emit("meeting-created", meeting);
  });

  socket.on("check-meeting-exists", (meetingId) => {
    socket.emit(
      "meeting-exists",
      meetings.some((m) => m.id === meetingId)
    );
  });

  socket.on("join-meeting", (meetingId, user) => {
    const meeting = meetings.find((m) => m.id === meetingId);

    if (!meeting) {
      socket.emit("meeting-not-found");
      return;
    }
    socket.join(meetingId);
    socket.data.user = user;
    socket.to(meetingId).emit("user-joined", socket.id, socket.data.user);

    socket.on("disconnect", () => {
      socket
        .to(meetingId)
        .emit("user-disconnected", socket.id, socket.data.user);
    });
  });

  socket.on("leave-meeting", (meetingId) => {
    socket.to(meetingId).emit("user-left", socket.id, socket.data.user);
  });

  socket.on("offer", ({ offer, to }) => {
    socket
      .to(to)
      .emit("offer", { offer, from: socket.id, user: socket.data.user });
  });

  socket.on("answer", ({ answer, to }) => {
    socket
      .to(to)
      .emit("answer", { answer, from: socket.id, user: socket.data.user });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("send-message", ({ meetingId, message }) => {
    socket.to(meetingId).emit("new-message", {
      userId: socket.userId,
      message,
      user: socket.data.user,
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
