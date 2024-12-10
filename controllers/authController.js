// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// Register new user (Send OTP without creating the user)
// controllers/authController.js

const registerUser = async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP expires in 10 minutes

    // Create a new user with OTP details
    const newUser = new User({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    // Save user to database
    await newUser.save();

    // Send OTP to the user's email
    const subject = "Your OTP for Account Verification";
    const text = `Your OTP is: ${otp}. It will expire in 10 minutes.`;
    await sendEmail(email, subject, text);  // Passing dynamic user email

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for OTP verification.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// OTP Verification Controller (Create the user after OTP verification)
const verifyOtp = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // If the OTP entered is incorrect, return an error but do not invalidate the OTP entirely.
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is already verified
    if (user.otpVerified) {
      return res.status(400).json({ message: "OTP already verified" });
    }

    // Mark OTP as verified
    user.otpVerified = true;

    // If the user has provided a new password, hash and update it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the user with the OTP verified flag and possibly updated password
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// User login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if OTP is verified
    if (!user.otpVerified) {
      return res.status(400).json({ message: "Please verify your OTP first" });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, verifyOtp, loginUser };
