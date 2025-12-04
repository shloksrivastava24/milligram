const Like = require("../models/Like");
const Post = require("../models/Post");

const likePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const {postId} = req.params;

        const existing = await Like.findOne({user: userId, post: postId});
        if (existing){
            return res.status(400).json({message: "post already liked!"});
        }

        await Like.create({user: userId, post: postId});
        await Post.findByIdAndUpdate(postId, {$inc: {likesCount: 1}});
        res.status(200).json({message: "post liked"})
    } catch (error) {
        console.log("error occured:", error);
        res.status(500).json({message: "could not like post"});
    }
};

const unlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const {postId} = req.params;

        const existing = await Like.findOne({user: userId, post: postId});
        if (!existing){
            return res.status(400).json({message: "post not liked yet!"});
        }

        await Like.deleteOne({_id: existing._id});
        await Post.findByIdAndUpdate(postId, {$inc: {likesCount: -1}});
    } catch (error) {
        console.log("unlike post error:", error);
        res.status(500).json({message: "error occured while unliking!"});
    }
};

module.exports = {
    likePost,
    unlikePost,
};