const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require('./routes/userRoutes')
const messageRoute = require('./routes/messagesRoute')
const socket = require('socket.io')
const app = express();

app.use(cors({
  credentials: true, //if you are using authentication.
  origin: 'https://nexus-chat-app-fontend.vercel.app' // if line above is true, then this CANNOT be '*'
}))
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes)
app.use("/api/messages", messageRoute)

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
app.get("/", (req, res) => {
  res.json("hello");
})
const io = socket(server, {
  cors: {
    origin:"http://localhost:3000",
    credentials : true,
  }
})

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id)
  })

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message)
    }
  })
})