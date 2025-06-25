// models/db/accessToken.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IAccessToken extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'admin' | 'member' | 'user';
  token: string;
  expiresAt: Date;
}

const accessTokenSchema = new Schema<IAccessToken>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['admin', 'member', 'user'], required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

//  Prevent OverwriteModelError:
const AccessToken = mongoose.models.AccessToken || mongoose.model<IAccessToken>('AccessToken', accessTokenSchema);

export default AccessToken;
