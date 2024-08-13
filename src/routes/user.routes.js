import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserConverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

//secure routes
router.route("/login").post(loginUser);
router.route("/logout").post(verifyUser ,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-pasword").post(verifyUser, changeCurrentPassword)
router.route("/current-user").post(verifyUser, getCurrentUser)
router.route("/update-account").patch(verifyUser, updateAccountDetails)
router.route("/update-avatar").patch(verifyUser, upload.single("avatar"), updateUserAvatar)
router.route("/update-cover-image").patch(verifyUser, upload.single("coverImage"), updateUserConverImage)
router.route("/c/:username").get(verifyUser, getUserChannelProfile)
router.route("/watch-history").get(verifyUser, getWatchHistory)
export default router;
