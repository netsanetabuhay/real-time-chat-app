import Users from "../models/User";
import jwt from 'jsonwebtoken';

//middleware to protect routes


export const protectRoutes = async(rewq,res,next)=>{
    try {
        const token = req.headers.token;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const checkUser = await new Users.findById(decoded.id).select("-password");
        if(!checkUser){
            return res.json({success:false,
                message: "user not found"
            });
            req.user=checkUser;
            next();
        }

        
    } catch (error) {console.log(error.message);
        res.json({seccess:false,
            message:"error.message"
        });

        
    }
}