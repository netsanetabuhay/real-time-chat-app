// server.js
import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./lib/db.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server                      
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
}); 

//store online users
export const userSocketMap = {};

//socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('user connected: ' + userId);
    if(userId){userSocketMap[userId] = socket.id;}


    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("user disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })

});

app.use(express.json({ limit: "5mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("server is live"));
app.use("/api/auth", userRoute);
app.use("/api/messages", messageRoute);
 
const startServer = async () => {
    try {


     await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));

        
    } catch (error) {
        console.log(error.message);

        
    }
}
startServer();