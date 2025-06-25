// models/db/refreshToken.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'admin' | 'member' | 'user';
  token: string;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['admin', 'member', 'user'], required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

//  Prevent OverwriteModelError:
const RefreshToken = mongoose.models.RefreshToken || mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export default RefreshToken;
