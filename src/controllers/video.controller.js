import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async(req, res)=>{
    const {title, description} = req.body;

    if(title == "" || title == null || title == undefined || description == "" || description == null || description == undefined){
        throw new ApiError(400, "All fields are required")
    }

    if(!req.files || !Array.isArray(req.files.thumbnail) || !req.files.thumbnail.length>0){
        throw new ApiError(400, "Thumbnail file does not found")
    }

    if(!req.files || !Array.isArray(req.files.videoFile) || !req.files.videoFile.length>0){
        throw new ApiError(400, "videoFile file does not found")
    }

    const thumbnailLocalPath = req.files.thumbnail[0].path;
    const videoFileLocalPath = req.files.videoFile[0].path;

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);

    if(!thumbnail){
        throw new ApiError(400, "Thumbnail not found");
    }

    if(!videoFile){
        throw new ApiError(400, "Video file not found");
    }

    const uploadingVideo = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        isPublished: true,
        owner: req.user._id
    })

    const uploadedVideo = await Video.findById(uploadingVideo._id);

    if(!uploadedVideo){
        throw new ApiError(500, "video upload failed, please try again !!");
    }

    return res
    .status(200)
    .json( new ApiResponse(200, uploadedVideo, "Video uploaded successfully"));
    
});

const getVideoById = asyncHandler(async(req, res)=>{
    const { videoId } = req.params;

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id")
    }

    const video = await Video.findById(videoId);
    
    if(!video){
        throw new ApiError(400, "Video no found");
    }

    video.views = video.views + 1;
    const updatedVideo = await Video.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "video fetched successfully")
    )
});

const updateVideo = asyncHandler(async(req, res)=>{
    const {videoId} = req.params;
    const {title, description} = req.body;
    const {thumbnail} = req.file?.path;

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Video id is not valid");
    }

    const video = Video.findById(videoId);
    if(!videoId){
        throw new ApiError(400, "Video not found");
    }

    let uploadedThumbnail;
    if(thumbnail){
        uploadedThumbnail = await uploadOnCloudinary(thumbnail);

        if(!uploadedThumbnail){
            throw new ApiError(500, "video upload failed, please try again !!")
        }
    }

    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title: title? title : video.title,
                description: description? description : video.description, 
                thumbnail: uploadedThumbnail ? uploadedThumbnail.url : video.thumbnail
            }
        },
        {new: true}
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    )
});

const deleteVideo = asyncHandler(async(req, res)=>{
    const {videoId} = req.params;
    
    if(!videoId || isValidObjectId(videoId)){
        throw new ApiError(400, "Provide valid video id");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Vidoe not found");
    }

    await findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    )
});

const togglePublishStatus = asyncHandler(async(req, res)=>{
    const {videoId} = req.params;

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "valid Video id is required");
    }

    const video = Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Video not found");
    }

    video.isPublished = !video.isPublished;

    const updatedVideo = await video.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    )
})

export {
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}