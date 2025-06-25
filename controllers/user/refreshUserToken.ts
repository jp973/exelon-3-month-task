import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import AccessToken from '../../models/db/accessToken'; 

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const refreshUserToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentAccessToken = req.cookies.userToken;
    const refreshToken = req.cookies.refreshToken;

    if (!currentAccessToken || !refreshToken) {
      res.status(401).json({ success: false, message: 'Tokens missing' });
      return;
    }

    // Optional: Check if access token is still valid
    try {
      const decodedAccess = jwt.verify(currentAccessToken, JWT_SECRET) as JwtPayload;
      if (decodedAccess?.id) {
        res.status(200).json({
          success: false,
          message: 'Access token is still valid. No need to refresh.',
        });
        return;
      }
    } catch {
      // Continue to refresh if access token is expired
    }

    //  Validate refresh token by decoding it
    jwt.verify(refreshToken, JWT_SECRET, async (err: any, decoded: any) => {
      if (err || !decoded?.id) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      //  Check refresh token in DB
      const storedToken = await AccessToken.findOne({ userId: decoded.id, userType: 'user' });
      if (!storedToken) {
        return res.status(403).json({ success: false, message: 'No session found for this user' });
      }

      //  Issue new access token
      const newAccessToken = jwt.sign({ id: decoded.id, role: 'user' }, JWT_SECRET, { expiresIn: '1d' });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      //  Update token in DB
      storedToken.token = newAccessToken;
      storedToken.expiresAt = expiresAt;
      await storedToken.save();

      res.cookie('userToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'New user access token issued successfully',
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    next(error);
  }
};
