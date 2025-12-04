const Comment = require("../models/Comment");
const Post = require("../models/Post");

const addComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const {postId} = req.params;
        const {text} = req.body;

        if (!text || !text.trim()){
            return res.status(400).json({message: "text is required to post comment"});
        }
        const comment = await Comment.create({
            post: postId,
            author: userId,
            text: text.trim(),
        });

        await Post.findByIdAndUpdate(postId, {$inc: {commentsCount: 1}});

        await Comment.populate("author", "username name avatarUrl")
        res.status(200).json({comment});
    } catch (error) {
        console.log("addcomment error:", error);
        res.status(500).json({message: "error addcomment"});
    }
};

const getComments = async (req, res) => {
    try {
        const {postId} = req.params;
        const comments = await Comment.find({post: postId})
        .sort({createdAt: -1})
        .populate("author", "username name avatarUrl")
        res.json({comments})
    } catch (error) {
        console.log("get comments error:", error);
        res.status(500).json({message: "error get comments!!"});
    }
};

module.exports = {
    addComment,
    getComments,
};