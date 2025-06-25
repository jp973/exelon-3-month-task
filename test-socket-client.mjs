import mongoose from "mongoose";
import { io } from "socket.io-client";
import { connectDB } from "./models/connection.js"; // 👈 include `.js` extension

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema,"users");

async function main() {
  await connectDB();

  const user = await User.findOne();
  if (!user) {
    console.log("No user found in database.");
    process.exit(1);
  }

  const userId = user._id.toString();
  console.log("Using userId:", userId);

  const socket = io("http://localhost:3000", {
  query: {
    userId: userId
  }
});


    socket.on("connect", () => {
    console.log(`Joined notification room for userId: ${userId}`);
  });

  socket.on(`notification-${userId}`, (payload) => {
  console.log("Received notification:", payload);
});

}

main().catch(err => {
  console.error("Error in main():", err);
  process.exit(1);
});
