import mongoose, { Schema, Document } from 'mongoose';

interface IJoinRequest extends Document {
  groupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
}

const joinRequestSchema = new Schema<IJoinRequest>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model<IJoinRequest>('JoinRequest', joinRequestSchema);
