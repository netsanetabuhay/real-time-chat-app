import Users from '../models/User.js';
import Message from '../models/Message.js';

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
                    await promises.all(promises);
                    
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
            senderId: selectedUserId, receiverId: myId, seen: true        
         });
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
   