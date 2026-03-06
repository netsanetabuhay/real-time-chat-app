import express from "express";
import { signUp, login , updateProfile, checkAuth} from "../controller/userController.js";

import {protectRoutes} from "../middleware/auth.js";
const userRouter = express.Router();


userRouter.post("/signup", signUp);
userRouter.post("/login", login);


//protected route for updating user profile details

userRouter.put("/update-profile", protectRoutes, updateProfile);
userRouter.get("/check", protectRoutes, checkAuth);

export default userRouter;

