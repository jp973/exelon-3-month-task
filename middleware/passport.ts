import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import Admin from '../models/db/admin';
import Member from '../models/db/member';
import User from '../models/db/user';
import AccessToken from '../models/db/accessToken'; 

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

// Generalized strategy function for any user type
function createBearerStrategy(userType: 'admin' | 'member' | 'user', model: any, strategyName?: string) {
  passport.use(
    strategyName || userType,
    new BearerStrategy(async (token, done) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const stored = await AccessToken.findOne({ token, userType });
        if (!stored) return done(null, false); // Token not found or revoked

        const user = await model.findById(decoded.id);
        if (!user) return done(null, false);

        return done(null, user); // req.user = user
      } catch (err) {
        return done(null, false);
      }
    })
  );
}

// Apply bearer strategies
createBearerStrategy('admin', Admin); // default strategy
createBearerStrategy('member', Member, 'member-bearer');
createBearerStrategy('user', User, 'user-bearer');

export default passport;
