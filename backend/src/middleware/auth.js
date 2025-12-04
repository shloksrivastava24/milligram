const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({message: "not authenticated"});
        }

        const decoded = await jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-passwordHash");

        if (!user){
            return res.status(401).json({message: "user not found!"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("error occured:", error);
        return res.status(401).json({message: "invalid or expired token!"});
    }

};

module.exports = auth;