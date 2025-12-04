const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const url = process.env.MONGODB_URL;
        const conn = await mongoose.connect(url);
        console.log("mongoDB connection successfull!!");
    } catch (error) {
        console.log("mongoDB connection failed!!");
    }
};

module.exports = connectDB;