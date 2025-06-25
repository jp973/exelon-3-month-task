import { Server } from 'socket.io';
import { Notification } from '../models/db/notification';
import { MemberNotification } from '../models/db/memberNotification';
import Group from '../models/db/group'; //  Import the Group model

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    const memberId = socket.handshake.query.memberId as string;
    const groupId = socket.handshake.query.groupId as string;

    const finalId = userId || memberId || groupId;

    if (finalId) {
      const roomName = `notification-${finalId}`;
      socket.join(roomName);
      const role = userId ? 'User' : memberId ? 'Member' : 'Group';
      console.log(` ${role} ${finalId} joined room ${roomName}`);
    } else {
      console.warn(" Connection rejected: No userId, memberId, or groupId provided.");
    }

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });
  });

  return io;
};

//  Generic notification sender for user, member, or group
export function sendNotification(
  targetId: string,
  message: string,
  data: any = {},
  role: 'user' | 'member' | 'group' = 'user'
) {
  try {
    if (!io) throw new Error(" Socket.IO server not initialized");

    const room = `notification-${targetId}`;
    const event = `notification-${targetId}`;
    const payload = { targetId, message, data };

    //  Emit to clients
    io.to(room).emit(event, payload);
    console.log(` Sent ${role} notification to ${room}`);

    //  Save to DB
    if (role === 'user' || role === 'member') {
      const NotificationModel = role === 'member' ? MemberNotification : Notification;

      const newNotification = new NotificationModel({
        userId: targetId,
        message,
        data,
      });

      newNotification.save().catch((err) => {
        console.error(` Error saving ${role} notification to DB:`, err);
      });
    } else if (role === 'group') {
      // ✅ Save notification to Group.notifications[]
      Group.findById(targetId)
        .then((group) => {
          if (!group) {
            console.warn(` Group not found for ID: ${targetId}`);
            return;
          }

          group.notifications.push({
            message,
            timestamp: new Date(),
          });

          group.save().then(() => {
            console.log(` Group notification saved to DB for group ${targetId}`);
          }).catch((err) => {
            console.error(` Failed to save group notification:`, err);
          });
        })
        .catch((err) => {
          console.error(` DB error while finding group:`, err);
        });
    }
  } catch (error) {
    console.error(' Error sending notification:', error);
  }
}
