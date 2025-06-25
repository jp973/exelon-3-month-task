import express from 'express';
import { memberLogin, memberLogout } from '../../controllers/admin/memberAuth';
import { refreshMemberToken } from '../../controllers/admin/refreshMemberToken';
import { LoginValidation } from '../../validators/loginValidator';
import { validateRequest } from '../../middleware/validateRequest';
import { entryLogger } from '../../middleware/entrypoint';
import { exitLogger } from '../../middleware/exitpoint';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MemberAuth
 *   description: Member authentication endpoints
 */

/**
 * @swagger
 * /api/members/login:
 *   post:
 *     summary: Member login
 *     tags: [MemberAuth]
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
 *                 example: member@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Member login successful
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
 *                   example: Member login successful
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 memberId:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 */

router.post('/login', entryLogger, LoginValidation, validateRequest, memberLogin, exitLogger);

/**
 * @swagger
 * /api/members/logout:
 *   post:
 *     summary: Member logout
 *     tags: [MemberAuth]
 *     responses:
 *       200:
 *         description: Logout successful and tokens cleared
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
 *                   example: Member logged out successfully. Tokens cleared.
 *       401:
 *         description: Tokens missing in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Tokens missing
 *       500:
 *         description: Error during logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error during logout
 */

router.post('/logout', entryLogger, memberLogout, exitLogger);

/**
 * @swagger
 * /api/members/refresh-token:
 *   post:
 *     summary: Refresh member access token
 *     tags: [MemberAuth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Refresh token missing
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token',entryLogger, refreshMemberToken, exitLogger);

export default router;
