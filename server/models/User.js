import mongoose from "mongoose";

// creating the user schema
const userSchema=new mongoose.Schema({email:{type:String, required:true, unique:true},
fullname:{
    type:String,
    required:true,
},
password : {
    type:string,
    required:true,
    minlength:6
},
profilepic:{
    type:string,
    default:""
},
createdAt:{timestamps:true},


});
const Users = mongoose.connect("User", userSchema);
export default Users;