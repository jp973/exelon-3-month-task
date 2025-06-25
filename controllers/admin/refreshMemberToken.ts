import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import dotenv from 'dotenv';
import AccessToken from '../../models/db/accessToken';
import RefreshToken from '../../models/db/refreshToken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const refreshMemberToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const currentAccessToken = req.cookies.memberToken;

    if (!refreshToken || !currentAccessToken) {
      res.status(401).json({ success: false, message: 'Tokens missing' });
      return;
    }

    // Step 1: Check if access token is still valid
    jwt.verify(currentAccessToken, JWT_SECRET, (err: VerifyErrors | null, decoded: any) => {
      if (!err && decoded?.id) {
        return res.status(200).json({
          success: false,
          message: 'Access token is still valid. No need to refresh.',
        });
      }

      // Step 2: Verify refresh token
      jwt.verify(refreshToken, JWT_SECRET, async (err: VerifyErrors | null, decoded: any) => {
        if (err || !decoded?.id) {
          return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
        }

        const storedRefresh = await RefreshToken.findOne({
          userId: decoded.id,
          token: refreshToken,
          userType: 'member',
        });

        if (!storedRefresh) {
          return res.status(403).json({ success: false, message: 'Refresh token not found or revoked' });
        }

        // Step 3: Issue new access token
        const newAccessToken = jwt.sign({ id: decoded.id, role: 'member' }, JWT_SECRET, { expiresIn: '1d' });

        // Update or insert into AccessToken collection
        await AccessToken.findOneAndUpdate(
          { userId: decoded.id, userType: 'member' },
          {
            token: newAccessToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
          },
          { upsert: true, new: true }
        );

        // Set new access token cookie
        res.cookie('memberToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 1 day
          sameSite: 'strict',
        });

        res.status(200).json({
          success: true,
          message: 'New access token issued successfully',
          accessToken: newAccessToken,
        });
      });
    });
  } catch (error) {
    next(error);
  }
};
