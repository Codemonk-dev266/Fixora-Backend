import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModels.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.jwt_secret, { expiresIn: "5d" });
};

// Register
const register = async (req, res, next) => {
  try {
    // 1. destructure
    const { name, email, password, role } = req.body;

    // 2. validate user object or required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "there is no email" });
    }
    //  3. find user
    const existingUser = await User.findOne({ email });

    // 4. validate user
    if (existingUser) {
      return res.status(409).json({ message: "user already exist" });
    }

    // 5. hash password
    const hashPassword = await bcrypt.hash(password, 12);

    // 6. create user
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role: role || "customer",
    });

    // 7. assign token
    const token = generateToken(user._id);

    // 8. response
    res.status(201).json({
      message: "registration successful ",
      token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// login
const login = async (req, res) => {
  try {
    // 1. destructure
    const { email, password } = req.body;

    // 2. find user
    const user = await User.findOne({ email });

    // 3. validate user
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    // 5. validate password
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 6. assing jwt
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful. Please remove your token.",
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, getMe, logout };
