import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { deleteVideo, getVideoById, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/publish").post(
    verifyUser, 
    upload.fields(
        [
            {
                name: "thumbnail",
                maxCount: 1
            },
            {
                name: "videoFile",
                maxCount: 1,
            }
        ]
    ),
    publishVideo
)
router.route("/get-video").get(verifyUser, getVideoById)
router.route("/update").post(verifyUser,upload("thumbnail") ,updateVideo)
router.route("/delete").post(verifyUser, deleteVideo)
router.route("/publish").post(verifyUser, togglePublishStatus)

export default router;