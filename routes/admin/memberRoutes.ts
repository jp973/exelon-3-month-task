import express, { Request, Response, NextFunction } from 'express';
import passport from '../../middleware/passport';
import { refreshMemberToken } from '../../controllers/admin/refreshMemberToken';
import { entryLogger } from '../../middleware/entrypoint';
import { exitLogger } from '../../middleware/exitpoint';
import { memberValidationRules } from '../../validators/memberValidator';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createMember,
  getMembers,    
  getMemberById,
  updateMember,
  deleteMember,
  searchMembers
} from '../../controllers/admin/memberController';

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Member management endpoints
 */

const protectAdmin = passport.authenticate('admin', { session: false });

/**
 * @swagger
 * /api/members:
 *   post:
 *     summary: Create a new member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
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
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               date_joined:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Member created successfully
 *       400:
 *         description: Validation error or email already exists
 */
router.post(
  '/',
  entryLogger,
  protectAdmin,
  memberValidationRules,
  validateRequest,
  createMember,
  exitLogger
);

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of members
 *       401:
 *         description: Unauthorized
 */
router.get('/', entryLogger, protectAdmin, getMembers, exitLogger);

/**
 * @swagger
 * /api/members/{id}:
 *   get:
 *     summary: Get a member by ID
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The member ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.get('/:id', entryLogger, protectAdmin, getMemberById, exitLogger);

/**
 * @swagger
 * /api/members/{id}:
 *   put:
 *     summary: Update a member by ID
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The member ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Member object to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               date_joined:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.put('/:id', entryLogger, protectAdmin, updateMember, exitLogger);

/**
 * @swagger
 * /api/members/{id}:
 *   delete:
 *     summary: Delete a member by ID
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The member ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.delete('/:id', entryLogger, protectAdmin, deleteMember, exitLogger);

/**
 * @swagger
 * /api/members/search:
 *   post:
 *     summary: Search, filter, project, and paginate members
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pagination:
 *                 type: object
 *                 properties:
 *                   page:
 *                     type: integer
 *                     default: 1
 *                   limit:
 *                     type: integer
 *                     default: 10
 *               search:
 *                 type: object
 *                 properties:
 *                   term:
 *                     type: string
 *                     example: "john"
 *                   fields:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["name", "email"]
 *               filter:
 *                 type: object
 *                 additionalProperties: true
 *                 example:
 *                   address: "Bangalore"
 *               projection:
 *                 type: object
 *                 additionalProperties:
 *                   type: integer
 *                 example:
 *                   name: 1
 *                   email: 1
 *     responses:
 *       200:
 *         description: Members retrieved using aggregation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     members:
 *                       type: array
 *       400:
 *         description: Invalid input or no operations enabled
 *       500:
 *         description: Internal server error
 */

router.post('/search', entryLogger, protectAdmin, searchMembers, exitLogger);

export default router;