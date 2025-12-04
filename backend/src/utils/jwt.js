const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const createToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, JWT_SECRET, {expiresIn});
};

const sendTokenAsCookie = (res, user) => {
    const token = createToken({userId: user._id});
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7*24*60*60*1000,
    });
    return token;
};

module.exports = {
    createToken,
    sendTokenAsCookie,
};