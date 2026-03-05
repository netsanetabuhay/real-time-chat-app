import Users from "../models/User.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../lib/utils.js";


export const signUp = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    
    try {
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({
                success: false,
                message: "Missing details"
            });
        }
        
        const user = await Users.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Email already exists. Please use a different email or try logging in"
            });
        }
        const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new Users.create({
            fullName,
            email,
            password:hashedPassword,
            bio
        });

        const Token = generateToken(newUser._id)
        
        
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            userData: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                bio: newUser.bio
            }
        });
        
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration"
        });
    }
};

export const login =async(req, res)=>{
    const { email, password} = req.body;
    if(!email||!password){

        return res.status(400).json(success:false,
            message:"email and password are required to login "


        );
    }
}

