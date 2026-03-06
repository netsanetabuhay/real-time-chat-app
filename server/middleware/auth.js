import Users from "../models/User";
import jwt from 'jsonwebtoken';
//middleware to protect routes

export const protectRoutes = async(rewq,res,next)=>{
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const checkUser = await new Users.findById(decoded.id);
        
    } catch (error) {
        
    }
}