import Users from "../models/User.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";



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
        
        const newUser = await Users.create({
            fullName,
            email,
            password:hashedPassword,
            bio
        });

        
        
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
    try {
        const { email, password} = req.body;
    if(!email||!password){

        return res.status(400).json({success:false,
            message:"email and password are required to login "}


        );
         }

         const checkedUser= await Users.findOne({email});
        if(!checkedUser){
            return res.status(400).json({success:false,
                message:"you have not register already! please try to sing up"

            })
        }
          const muchPassWord = await bcrypt.compare(password, checkedUser.password)  
          if(!muchPassWord){
            return res.status(400).json({success:false,
                message:"invalide password please try to insert correct password"}
            );
            
          }

        
        const id= checkedUser._id;
         const Token = generateToken(id);
        
        return res.status(201).json({
            success: true,
            message: "User login successfully",
            userData: checkedUser,
            Token: Token
            
        });
   

    } catch (error) {
         console.error("Sign in error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
        
    }
    
}

export const checkAuth=(req, res)=>{
    res.json({success: true,
        user:req.user
    });
}

 export const updateProfile= async(req,res) => {
    try {
        const {profilePic, bio, fullName} = req.body;
        const userId= req.user._id; 
        let updatedUser;
        if(!profilePic){
            updatedUser = await Users.findByIdAndUpdate(userId, {
                fullName,
                bio
            }, {new:true}).select("-password");
        }
        else{
            const upload= await cloudinary.uploader.upload(profilePic);
            updatedUser = await Users.findByIdAndUpdate(userId, {
                profilePic: upload.secure_url,
                fullName,
                bio,
            }, 
            {new:true}).select("-password");
        }
        return res.status(200).json({success : true,
            message : "profile updated successfully",
            user : updatedUser
        });

    } catch (error) {
        console.error("Update profile error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during profile update :" + error.message
        });
    }
}

