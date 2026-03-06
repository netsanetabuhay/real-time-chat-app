import mongoose, { Types } from 'mongoose';
import User from '../models/User.js ';


const messageSchema= new mongoose.Schema({
    sendrId: {type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required :true
    },
    receiverId:{type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    text:{type:String,
    },
    image:{
        type:String,
    },
    seen : {type: Boolean, default: false}
},

 {timestamps:true},);
 const Message = mongoose.model("Message", messageSchema);
 export default Message;