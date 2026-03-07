import Users from '../models/User.js';
import Message from '../models/Message.js';
import cloudinary from '../lib/cloudinary.js';
import {io , userSocketMap} from '../server.js';


export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user.id;
        const filteredUsers = await Users.find({ _id: { $ne: userId } }).select('-password');

        const unseenMessage={};
            const promises = filteredUsers.map(async (user) => {
                const notseenMessage = await Message.find({
                    senderId:user._id, receiverId: userId, seen: false
                })
                if(notseenMessage.length > 0){
                    unseenMessage[user._id] = notseenMessage.length;}
            })
                    await Promise.all(promises);
                    
                    res.json({
                        success: true, 
                        users: filteredUsers,
                        unseenMessages : unseenMessage
                    });

    } catch (error) {
        console.log(error.Message);
        res.status(500).json({success: false, message:error.message });
    }
}

//get all messages for selected user
export const getMessages= async (req, res) => {
    try {
        const {id:selectedUserId} = req.params;
        const myId = req.user.id;

        const messages =  await Message.find({
            $or:[{senderId: myId, receiverId: selectedUserId}, {senderId: selectedUserId, receiverId: myId}]
        })

        await Message.updateMany({
            senderId: selectedUserId, receiverId: myId, seen: false
        }, {seen: true});        
        
         res.json({success: true, messages});

        
    } catch (error) {
        console.log(error.Message);
        res.status(500).json({success: false, message:error.message });
    }
}

//api to mark the message as seen using message id 
export const markMessageAsSeen = async (req, res) => {
    try {
        const {id}= req.params;
        await Message.findByIdAndUpdate(id, {seen: true});
        res.json({success: true});
    } catch (error) {
        console.log(error.Message);
        res.status(500).json({success: false, message:error.message });
    }
}

//send message to selected user

export const sendMessage = async(req, res) => { 
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        let imageUrl ;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({senderId, receiverId, text, image: imageUrl});

        // emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }
        res.status(200).json({success: true, message: newMessage});
     
}

    catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message});
    }
}


   