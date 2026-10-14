
import express from "express";

import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";

import authMiddleWare from "../middleWare/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and returns a JWT token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Franklin
 *               email:
 *                 type: string
 *                 format: email
 *                 example: franklin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123
 *               role:
 *                 type: string
 *                 enum:
 *                   - customer
 *                   - provider
 *                 default: customer
 *                 example: customer
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: registration successful
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: 68a123456789abcdef123456
 *                     name:
 *                       type: string
 *                       example: Franklin
 *                     email:
 *                       type: string
 *                       example: franklin@example.com
 *                     role:
 *                       type: string
 *                       enum: [customer, provider]
 *                       example: customer
 *       400:
 *         description: Required fields are missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: there is no email
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user already exist
 *       500:
 *         description: Internal server error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Verifies the user's email and password and returns a JWT token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: franklin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 68a123456789abcdef123456
 *                     name:
 *                       type: string
 *                       example: Franklin
 *                     email:
 *                       type: string
 *                       example: franklin@example.com
 *                     role:
 *                       type: string
 *                       enum: [customer, provider]
 *                       example: customer
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the authenticated user's information
 *     description: Returns the user information attached to the decoded JWT by the authentication middleware.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: Decoded JWT payload attached to req.user
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: 68a123456789abcdef123456
 *       401:
 *         description: Token is missing, invalid, or expired
 *       500:
 *         description: Internal server error
 */
router.get("/me", authMiddleWare, getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out the authenticated user
 *     description: >
 *       Returns a logout confirmation. The client must remove its stored
 *       JWT token. This endpoint does not invalidate the token on the server.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful. Please remove your token.
 *       401:
 *         description: Token is missing, invalid, or expired
 *       500:
 *         description: Internal server error
 */
router.post("/logout", authMiddleWare, logout);

export default router;

