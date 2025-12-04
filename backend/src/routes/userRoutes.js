const express = require("express");
const {getUserProfile, getUserPosts} = require("../controllers/userController");

const router = express.Router();

//get user profile
router.get("/:username", getUserProfile);

//get user posts
router.get("/:username/posts", getUserPosts);

module.exports = router;