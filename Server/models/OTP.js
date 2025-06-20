const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
        type:Date,
        default:Date.now(),
        expires: 5*60,
    }
});

//creating a function to send mail to the user 

async function sendVerificationOTP(email, otp) {
    try {
        const mailResponse = await mailSender( email , "Verification Email", emailTemplate(otp) )
        console.log("Email sent Successfully: ", mailResponse.response);
    } catch (error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
} 

OTPSchema.pre("save", async function (next) {     //pre save naam ka middleware banaya hai humne // ki humara document save hone se phele aap ek verification mail bhejege 
    console.log("Mail in pre hook", this.email)
    await sendVerificationOTP(this.email, this.otp);  // with this data this.email , this.otp  , aur ye krne ke baad hum next middleware prr chale jayege 
    next();
}) 

  module.exports = mongoose.model("OTP", OTPSchema);   // name of this model is OTP and the schema is OTPSchema