const cloudinary = require("../config/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");


const createPost = async (req, res) => {
    try {
        const user = req.user;
        const { caption } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "image is required!" });
        }
        const uploaded = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'milligram/posts',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        const post = await Post.create({
            author: user._id,
            imageUrl: uploaded.secure_url,
            caption: caption || '',
        });

        await post.populate('author', 'username name avatarUrl');
        res.status(200).json({ post });
    } catch (error) {
        console.error('create post error:', error);
        res.status(500).json({ message: 'could not create post' })
    }
};

const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '10', 10);
        const skip = (page - 1) * limit;

        const posts = await Post
            .find()
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .populate('author', 'username name avatarUrl')
            

        res.json({ posts, page, limit });
    } catch (error) {
        console.error('get feed error', error);
        res.status(500).json({ message: "could not fetch data" })
    }
};

const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Only author can delete
        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Delete media from Cloudinary
        if (post.imagePublicId) {
            await cloudinary.uploader.destroy(post.imagePublicId);
        }

        // Cascade delete
        await Comment.deleteMany({ post: postId });
        await Like.deleteMany({ post: postId });
        await post.deleteOne();

        res.json({ message: "Post deleted with comments and likes" });
    } catch (error) {
        console.log("deletePost error:", error);
        res.status(500).json({ message: "Could not delete post" });
    }
};

module.exports = {
    createPost,
    getFeed,
    deletePost,
};