const config = require("config");
const twilio = require("twilio");

module.exports.sendMessage = async (to, message) => {
    const accountSid = config.get("twilioSid");
    const authToken = config.get("twilioAuthToken");
    const client = twilio(accountSid, authToken);

    // await client.messages.create({
    //     body: message,
    //     from: "+12513513525",
    //     to: `+91${to}`,
    // });
};
