import JsonWebToken from "jsonwebtoken";
export const generateToken=(id)=>{
    const Token=JsonWebToken.sign({ _id: id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE});
    return Token;
}