import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupNotification {
  message: string;
  timestamp: Date;
}

export interface IGroup extends Document {
  groupName: string;
  maxUsers: number;
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  notifications: IGroupNotification[]; 
}

const groupSchema = new Schema<IGroup>(
  {
    groupName: { type: String, required: true, unique: true },
    maxUsers: { type: Number, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    notifications: [ //  Embedded messages array
      {
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IGroup>('Group', groupSchema);
