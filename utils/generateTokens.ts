import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateTokens = (adminId: string) => {
const accessToken = jwt.sign(
{ id: adminId, role: 'admin' },
process.env.JWT_SECRET!,
{ expiresIn: '1h' }
);

const refreshToken = jwt.sign(
{ id: adminId },
process.env.JWT_SECRET!,
{ expiresIn: '30d' }
);

return { accessToken, refreshToken };
};