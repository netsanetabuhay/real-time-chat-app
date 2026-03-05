import JsonWebToken from "jsonwebtoken";
export const generateToken=(user)=>{
    const Token=JsonWebToken.sign({user},process.env.       JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE });
        return Token;
}