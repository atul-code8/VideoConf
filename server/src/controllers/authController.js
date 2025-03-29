const pool = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingName = "SELECT * FROM users WHERE name = $1";
    const existingUser = "SELECT * FROM users WHERE email = $1";
    const existingUserResult = await pool.query(existingUser, [email]);
    const existingNameResult = await pool.query(existingName, [name]);
    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (existingNameResult.rows.length > 0) {
      return res.status(400).json({ error: "Name already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4) RETURNING *";
    const result = await pool.query(query, [ uuidv4(), email, hashedPassword, name]);
    const user = result.rows[0];
    res
      .status(201)
      .json({
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res
          .status(200)
          .json({ message: "Token generated successfully", token: token });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
};
