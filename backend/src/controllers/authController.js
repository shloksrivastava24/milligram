const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendTokenAsCookie } = require("../utils/jwt");
const { get } = require("mongoose");

const register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "all fields are required!" });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() },
            ],
        });

        if (existingUser) {
            return res.status(409).json({ message: "email or username already in use!!" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            passwordHash,
        });

        sendTokenAsCookie(res, user);

        const userSafe = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl || null,
        };

        res.status(201).json({ user: userSafe });

    } catch (error) {
        console.error("registration error:", error);
        res.status(500).json({ message: "something went wrong" })
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password is required!!" });
        }

        const user = await User.findOne({email: email.toLowerCase()});
        if (!user || !user.passwordHash){
            return res.status(401).json({message: "invalid email or password"});
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch){
            return res.status(401).json({message: "invalid password or email!!"});
        }

        sendTokenAsCookie(res, user);

        const userSafe = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl || null,
        };
        
        res.json({user: userSafe});
    } catch (error) {
        console.log("error occured:", error);
        res.status(500).json({message: "something went wrong"});
    }

};

const getMe = async (req, res) => {
    res.json({user: req.user});
};

const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({message: "logged out successfully!"})
};

module.exports = { register, login, getMe, logout };