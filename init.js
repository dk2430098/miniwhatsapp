const mongoose = require("mongoose");
require("dotenv").config();
const Chat = require("./models/chat.js");

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB successfully");

    // Optional: Clear existing chats to avoid duplicates
    await Chat.deleteMany({});
    console.log("Cleared existing chats");

    // Sample chat data
    const allChats = [
      {
        from: "neha",
        to: "priy",
        msg: "send your exam sheets",
        created_at: new Date(),
      },
      {
        from: "Amit",
        to: "Sudheer",
        msg: "How are you ?",
        created_at: new Date(),
      },
      {
        from: "Kamal",
        to: "Deepak",
        msg: "When will you come in college ?",
        created_at: new Date(),
      },
      {
        from: "Himanshu",
        to: "Gulshan",
        msg: "All are okay!",
        created_at: new Date(),
      },
    ];

    // Insert sample chats
    const insertedChats = await Chat.insertMany(allChats);
    console.log("Inserted chats:", insertedChats);

    // Close the connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the initialization
main();
