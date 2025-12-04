const User = require("../models/User");
const Post = require("../models/Post");

const getUserProfile = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username: username.toLowerCase()}).select("-passwordHash -_v");
        if(!user){
            return res.status(404).json({message: "user not found"});
        }

        res.json({user});
    } catch (error) {
        console.error("getUserProfile error:", error);
        res.status(500).json({message: "could not fetch user profile"});
    }
};

const getUserPosts = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username: username.toLowerCase()});
        if(!user){
            return res.status(404).json({message: "user not found"});
        }
        const posts = await Post.find({author: user._id}).sort({createdAt: -1}).populate("author", "username name avatarUrl");
        res.json({posts});
    } catch (error) {
        console.log("getUserPosts error:", error);
        res.status(500).json({message: "could not fetch user posts"});
    }
};

module.exports = {
    getUserProfile,
    getUserPosts,
}