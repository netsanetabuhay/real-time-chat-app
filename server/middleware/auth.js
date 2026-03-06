import  Users from "../models/User.js";
import jwt from 'jsonwebtoken';

//middleware to protect routes


export const protectRoutes = async(req,res,next)=>{
    try {
        const token = req.headers.token;  // ✅ FIXED: removed "oken"
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded:", decoded);
        const checkUser = await Users.findById(decoded._id).select("-password");
        console.log("checkUser:", checkUser);
        
        if(!checkUser){
            return res.json({
                success: false,
                message: "user not found"
            });
        }
        
        console.log("checkUser._id:", checkUser._id);
        req.user = checkUser;
        next();

    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,  // ✅ Fixed typo
            message: error.message  // ✅ Fixed: removed quotes
        });
    }
}