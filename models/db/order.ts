
//project\models\db\order.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  memberId: mongoose.Types.ObjectId;
  orderId: string;
  isPaid: boolean;
}

const orderSchema = new Schema<IOrder>({
  memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  orderId: { type: String, required: true },
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', orderSchema);
