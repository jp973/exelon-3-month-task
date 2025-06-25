import mongoose, { Document, Schema } from 'mongoose';

export interface AdminDocument extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<AdminDocument>({
  username: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
  },
  password: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.model<AdminDocument>('Admin', adminSchema);

export default Admin;
