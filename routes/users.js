const express = require("express");
const fs = require("fs");
const path = require("path");
const config = require("config");
const router = express.Router();
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { User, validateInfo, validateOTP } = require("../modules/users");
const asyncHandler = require("../middleware/asyc");
const isAuth = require("../middleware/auth");
const { sendOTP, verifyOTP } = require("../utility/otp");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        let ext = ".jpg";
        if (file.mimetype === "image/png") ext = ".png";
        cb(null, req.userId + "-" + Date.now() + ext);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
});

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const { error } = validateInfo(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ phoneNo: req.body.phoneNo });
        if (user && user.isVerified)
            return res.status(400).send("Phone No. Already Exists.");

        if (user && !user.isVerified) {
            await user.remove();
        }

        req.body.password = await bycrypt.hash(req.body.password, 10);

        user = new User(req.body);
        await user.save();

        await sendOTP(user);
        res.status(200).send("OTP Sent Succesfully !");
    })
);

router.post(
    "/verify",
    asyncHandler(async (req, res) => {
        const { error } = validateOTP(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ phoneNo: req.body.phoneNo });
        if (!user)
            return res.status(404).send("Please Provide Valid Phone No. !");

        const isValid = await verifyOTP(user, req.body.otp);
        if (!isValid) return res.status(400).send("Please Provide Valid OTP");

        user.isVerified = true;
        await user.save();

        const token = jwt.sign(
            { _id: user._id, tokenGenOn: Date(Date.now()) },
            config.get("jwtPrivateKey")
        );
        res.header("x-auth-token", token)
            .status(200)
            .send("Authorized Succesfully!");
    })
);

router.get(
    "/",
    isAuth,
    asyncHandler(async (req, res) => {
        const user = await User.findOne({ _id: req.userId }).select({
            password: 0,
            otp: 0,
            requests: 0,
        });
        res.status(200).send(user);
    })
);

router.get(
    "/uploads/:file",
    asyncHandler(async (req, res) => {
        res.sendFile(path.join(__dirname, "../uploads/", req.params.file));
    })
);

router.put(
    "/",
    isAuth,
    upload.single("profilePic"),
    asyncHandler(async (req, res) => {
        let user = await User.findOne({ _id: req.userId }).select({
            password: 0,
        });
        if (req.file) {
            if (user.profilePic.path !== "uploads/default.png") {
                fs.unlinkSync(user.profilePic.path);
            }
            user.profilePic = req.file;
        }
        user.status = req.body.status;
        await user.save();
        res.status(200).send(user);
    })
);

router.delete(
    "/",
    isAuth,
    asyncHandler(async (req, res) => {
        await User.deleteOne({ _id: req.userId });
        res.status(200).send("Account Deleted Successfully !");
    })
);

module.exports = router;
