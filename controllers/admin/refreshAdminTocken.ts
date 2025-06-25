// controllers/admin/refreshAdminToken.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import AccessToken from '../../models/db/accessToken';
import RefreshToken from '../../models/db/refreshToken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const refreshAdminToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentAccessToken = req.cookies.adminToken;
    const refreshToken = req.cookies.refreshToken;

    if (!currentAccessToken || !refreshToken) {
      res.status(401).json({ success: false, message: 'Tokens missing' });
      return;
    }

    // Optional: If access token is still valid, skip refreshing
    try {
      const decodedAccess = jwt.verify(currentAccessToken, JWT_SECRET) as JwtPayload;
      if (decodedAccess?.id) {
        res.status(200).json({
          success: false,
          message: 'Access token is still valid. No need to refresh.',
        });
        return;
      }
    } catch (err) {
      // Access token likely expired – continue to refresh
    }

    // Find refresh token document
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken, userType: 'admin' });
    if (!tokenDoc) {
      res.status(403).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    jwt.verify(refreshToken, JWT_SECRET, async (err: any, decoded: any) => {
      if (err || !decoded?.id) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      if (tokenDoc.userId.toString() !== decoded.id) {
        return res.status(403).json({ success: false, message: 'Token does not belong to this admin' });
      }

      // Generate new access token
      const newAccessToken = jwt.sign({ id: decoded.id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

      // Delete old access token and insert new one
      await AccessToken.deleteMany({ userId: decoded.id, userType: 'admin' });

      await AccessToken.create({
        userId: decoded.id,
        userType: 'admin',
        token: newAccessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      });

      res.cookie('adminToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'New access token issued successfully',
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    next(error);
  }
};
