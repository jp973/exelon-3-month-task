import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../../models/db/order';

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    console.error('Webhook secret is not defined in environment variables.');
    return res.status(500).json({ success: false, message: 'Webhook secret not configured.' });
  }

  const payload = req.body.toString();
  const receivedSignature = req.headers['x-razorpay-signature'];

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    console.log("signature", generatedSignature);

  if (!receivedSignature || generatedSignature !== receivedSignature.toString()) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }
  const parsedBody = JSON.parse(payload);
  const event = parsedBody.event;
  const payment = parsedBody.payload?.payment?.entity;

  console.log('Webhook Event:', event);
  console.log('Payment Data:', payment);

  if (event === 'payment.captured' && payment?.order_id) {
  try {
     const order = await Order.findOne({ orderId: payment.order_id });

    if (!order) {
       console.error(`Order not found: ${payment.order_id}`);
    } 
    else if (order.isPaid) {
       console.log(`Order ${payment.order_id} is already marked as paid.`);
    } 
    else {
       order.isPaid = true;
      await order.save();
      console.log(`Order ${payment.order_id} marked as paid.`);
    }
  } catch (err) {
     console.error('Error updating order status:', err);
  }
}


  return res.status(200).json({ success: true, message: 'Webhook received' });
};
