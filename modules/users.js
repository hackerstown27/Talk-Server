const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
        trim: true,
        lowercase: true,
    },
    phoneNo: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"],
    },
    dob: {
        type: Date,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true,
    },
    status: {
        type: String,
        enum: ["online", "offline", "away"],
        default: "offline",
        required: true,
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId],
    },
    requests: {
        type: [mongoose.Schema.Types.ObjectId],
    },
    profilePic: {
        type: Object,
        default: {
            fieldname: "profilePic",
            originalname: "default",
            encoding: "7bit",
            mimetype: "image/jpeg",
            destination: "uploads",
            filename: "default.png",
            path: "uploads/default.png",
            size: 27847,
        },
        required: true,
    },
    otp: {
        value: {
            type: String,
            minlength: 6,
            maxlength: 6,
        },
        validTill: {
            type: Date,
        },
        used: {
            type: Boolean,
        },
    },
    recentMessages: [mongoose.Schema.Types.ObjectId],
});

const User = mongoose.model("User", userSchema);

function validateInfo(user) {
    const schema = {
        name: Joi.string().required().min(3).max(255).trim(),
        phoneNo: Joi.string().required().min(10).max(10),
        password: Joi.string().required(),
        gender: Joi.string().required(),
        dob: Joi.date().required(),
    };
    return Joi.validate(user, schema);
}

function validateCred(user) {
    const schema = {
        phoneNo: Joi.string().required().min(10).max(10),
        password: Joi.string().required().min(6),
    };
    return Joi.validate(user, schema);
}

function validatePass(password) {
    const schema = {
        oldPassword: Joi.string().required().min(6),
        newPassword: Joi.string().required().min(6),
    };
    return Joi.validate(password, schema);
}

function validatePhoneNo(phoneNo) {
    const schema = {
        phoneNo: Joi.string().required().min(10).max(10),
    };
    return Joi.validate(phoneNo, schema);
}

function validateOTP(otp) {
    const schema = {
        phoneNo: Joi.string().required().min(10).max(10),
        otp: Joi.string().required().min(6).max(6),
    };
    return Joi.validate(otp, schema);
}

module.exports.User = User;
module.exports.validateInfo = validateInfo;
module.exports.validateCred = validateCred;
module.exports.validatePass = validatePass;
module.exports.validatePhoneNo = validatePhoneNo;
module.exports.validateOTP = validateOTP;
