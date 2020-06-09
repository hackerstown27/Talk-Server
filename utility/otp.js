const { genRandomNumber } = require("../utility/random");
const { sendMessage } = require("../utility/twilio");

module.exports.sendOTP = async (user) => {
    const otp = genRandomNumber(100000, 999999);
    const message = `Talk: Your OTP is ${otp}`;
    await sendMessage(user.phoneNo, message);
    user.otp.value = otp;
    user.otp.validTill = new Date(Date.now() + 600000);
    user.otp.used = false;
    await user.save();
};

module.exports.verifyOTP = async (user, otp) => {
    const isValidNow = user.otp.validTill.getTime() >= Date.now();
    if (user.otp.value === otp && isValidNow && !user.otp.used) {
        user.otp.used = true;
        await user.save();
        return true;
    }
    return false;
};
