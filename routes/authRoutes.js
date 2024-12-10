// routes/authRoutes.js

const express = require("express");
const {
  registerUser,
  verifyOtp,
  loginUser,
} = require("../controllers/authController");

const router = express.Router();

// Register route
router.post("/signup", registerUser);

// OTP verification route
router.post("/verify-otp", verifyOtp);

// Login route
router.post("/signin", loginUser);

module.exports = router;
