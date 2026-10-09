import express from "express";

import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import authMiddleWare from "../middleWare/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authMiddleWare, getMe);

router.post("/logout", authMiddleWare, logout);

export default router;
