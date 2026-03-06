import mongoose from "mongoose";

// creating the user schema
const userSchema=new mongoose.Schema({email:{type:String, required:true, unique:true},
fullName:{
    type:String,
    required:true,
},
password : {
    type:String,
    required:true,
    minlength:6
},
profilepic:{
    type:String,
    default:""
},
 bio: {  // You were missing bio field
        type: String,
        default: ""
    }},

{timestamps:true},
);
const Users = mongoose.model("Users", userSchema);
export default Users;