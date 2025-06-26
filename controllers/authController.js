// controllers/authController.js
//import bcrypt from "bcryptjs";
//import jwt from "jsonwebtoken";
let  User =require("../models/User.js")

// LOGIN USER
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
 
  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log(password)
    // 2. Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid credentials" });

    // 3. Create token
    const token = jwt.sign(
      { _id: user._id, email: user.email, teacher: user.teacher },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4. Return user data (omit password)
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        teacher: user.teacher,
        enrolledCourses: user.enrolledCourses,
        totalPoints: user.totalPoints
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// SIGNUP USER (Optional)
exports.signupUser = async (req, res) => {
  const { name, email, password, teacher = false } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: password,
      teacher,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
};
