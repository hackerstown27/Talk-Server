const express = require("express");
const config = require("config");
const router = express.Router();
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    User,
    validatePass,
    validateCred,
    validatePhoneNo,
    validateOTP,
} = require("../modules/users");
const asyncHandler = require("../middleware/asyc");
const isAuth = require("../middleware/auth");
const { sendOTP, verifyOTP } = require("../utility/otp");
const { genRandomString } = require("../utility/random");
const { sendMessage } = require("../utility/twilio");

router.post(
    "/login",
    asyncHandler(async (req, res) => {
        const { error } = validateCred(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ phoneNo: req.body.phoneNo });

        if (!user || !user.isVerified)
            return res
                .status(401)
                .send("Please Check Your Phone No. & Password !");

        const isAuth = await bycrypt.compare(req.body.password, user.password);

        if (isAuth) {
            const token = jwt.sign(
                { _id: user._id, tokenGenOn: Date(Date.now()) },
                config.get("jwtPrivateKey")
            );
            return res
                .header("x-auth-token", token)
                .status(200)
                .send("Authorized Succesfully!");
        } else {
            return res
                .status(401)
                .send("Please Check Your Phone No. & Password !");
        }
    })
);

router.put(
    "/changePassword",
    isAuth,
    asyncHandler(async (req, res) => {
        const { error } = validatePass(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ _id: req.userId });
        const isAuth = await bycrypt.compare(
            req.body.oldPassword,
            user.password
        );
        if (isAuth) {
            user.password = await bycrypt.hash(req.body.newPassword, 10);
            await user.save();
            return res.status(200).send("Password Updated Successfully !");
        } else {
            return res.status(401).send("Please Check Your Old Password !");
        }
    })
);

router.post(
    "/forgetPassword",
    asyncHandler(async (req, res) => {
        const { error } = validatePhoneNo(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ phoneNo: req.body.phoneNo });
        if (!user || !user.isVerified)
            return res.status(404).send("Please Provide Valid Phone No. !");

        await sendOTP(user);
        res.status(200).send("OTP Sent Succesfully !");
    })
);

router.post(
    "/forgetPassword/verify",
    asyncHandler(async (req, res) => {
        const { error } = validateOTP(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ phoneNo: req.body.phoneNo });
        if (!user)
            return res.status(404).send("Please Provide Valid Phone No. !");

        const isValid = await verifyOTP(user, req.body.otp);
        if (!isValid) return res.status(400).send("Please Provide Valid OTP");

        const newPassword = genRandomString(8);
        user.password = await bycrypt.hash(newPassword, 10);
        await user.save();

        const message = `Talk: Your New Password is ${newPassword}`;
        await sendMessage(user.phoneNo, message);

        res.status(200).send(
            "New Password Has Been Sent To Your Registerd Phone No."
        );
    })
);

module.exports = router;
