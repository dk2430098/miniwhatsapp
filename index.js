const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 8080;

const mongoose = require("mongoose");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// MongoDB Connection
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

main();

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .render("error.ejs", { title: "Error", message: "Something went wrong!" });
});

// Home Route
app.get("/", (req, res) => {
  res.render("home.ejs", { title: "Welcome to Mini WhatsApp" });
});

// Index Route
app.get("/chats", async (req, res, next) => {
  try {
    const chats = await Chat.find().sort({ created_at: -1 });
    res.render("index.ejs", { title: "All Chats", chats });
  } catch (error) {
    next(error);
  }
});

// New Route
app.get("/chats/new", (req, res) => {
  res.render("new.ejs", { title: "Create New Chat" });
});

// Create Route
app.post("/chats/create", async (req, res, next) => {
  try {
    const { from, msg, to } = req.body;

    if (!from || !msg || !to) {
      return res.status(400).render("error.ejs", {
        title: "Error",
        message: "All fields are required",
      });
    }

    const newChat = new Chat({
      from: from.trim(),
      msg: msg.trim(),
      to: to.trim(),
      created_at: new Date(),
    });

    await newChat.save();
    res.redirect("/chats");
  } catch (error) {
    next(error);
  }
});

// Edit Route
app.get("/chats/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);
    if (!chat) {
      return res
        .status(404)
        .render("error.ejs", { title: "Error", message: "Chat not found" });
    }
    res.render("edit.ejs", { title: "Edit Chat", chat });
  } catch (error) {
    next(error);
  }
});

// Update Route
app.put("/chats/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { msg } = req.body;

    if (!msg) {
      return res.status(400).render("error.ejs", {
        title: "Error",
        message: "Message is required",
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      { msg: msg.trim(), updated_at: new Date() },
      { runValidators: true, new: true }
    );

    if (!updatedChat) {
      return res
        .status(404)
        .render("error.ejs", { title: "Error", message: "Chat not found" });
    }

    res.redirect("/chats");
  } catch (error) {
    next(error);
  }
});

// Delete Route
app.delete("/chats/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedChat = await Chat.findByIdAndDelete(id);
    if (!deletedChat) {
      return res
        .status(404)
        .render("error.ejs", { title: "Error", message: "Chat not found" });
    }
    res.redirect("/chats");
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
