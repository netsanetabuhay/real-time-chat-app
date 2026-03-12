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

export const login = async(req, res)=>{
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

// FIXED: updateProfile with optional fields - update only what is provided
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = {};
        
        // Only add fields that are provided in the request
        if (req.body.fullName !== undefined) {
            updateData.fullName = req.body.fullName;
        }
        
        if (req.body.bio !== undefined) {
            updateData.bio = req.body.bio;
        }
        
        // Handle profile picture if provided
        if (req.body.profilePic) {
            try {
                console.log("Uploading image to cloudinary...");
                const upload = await cloudinary.uploader.upload(req.body.profilePic, {
                    folder: "chat-app/profiles",
                });
                console.log("Cloudinary upload successful:", upload.secure_url);
                updateData.profilepic = upload.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload image"
                });
            }
        }
        
        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }
        
        // Update user in database
        const updatedUser = await Users.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true }
        ).select("-password");
        
        console.log("User updated successfully:", updatedUser);
        
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update profile error:", error.message);
        console.error("Full error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during profile update"
        });
    }
}