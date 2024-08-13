import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyUser = asyncHandler(async(req, res, next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("decoded:::::", decodedToken)
    
        const user = await User.findById(decodedToken.id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token")
    }

})