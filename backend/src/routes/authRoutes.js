const express = require("express");
const {register, login, getMe, logout} = require("../controllers/authController");
const router = express.Router();
const auth = require("../middleware/auth")

//register new user
router.post("/register", register);

//login user
router.post("/login", login);

//get user
router.get("/me", auth, getMe);

//logout user
router.post("/logout", auth, logout);


module.exports = router;