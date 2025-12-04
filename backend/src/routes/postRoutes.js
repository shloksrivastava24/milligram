const express = require('express');
const {createPost, getFeed, deletePost} = require('../controllers/postController');
const auth = require("../middleware/auth");
const upload = require('../middleware/upload');
const {likePost, unlikePost} = require("../controllers/likeController");
const {getComments, addComment} = require("../controllers/commentController");
const router = express.Router(); 

//create a post
router.post('/', auth, upload.single('image'), createPost);

//get global feed
router.get('/', getFeed);

//like a post
router.post('/:postId/likes', auth, likePost);

//unlike post
router.delete('/:postId/likes', auth, unlikePost);

//add a comment
router.post('/:postId/comments', auth, addComment);

//get all comments
router.get('/:postId/comments', auth, getComments)

//delete post
router.delete("/:postId", auth, deletePost);


module.exports = router;