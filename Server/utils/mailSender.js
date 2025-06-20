const nodemailer = require("nodemailer");
require("dotenv").config();    // .evn file ki config ko process.env me daal dega
 
// itna sb hum issliye krr rhe hai taki hum OTP ko mail me send krr paye 


//mailSender function jo mail bhejne ka kaam karega
const mailSender = async (email, title, body) =>{
    try {
        // create reusable transporter object using the default SMTP transport
        // yeha hum transpoter banayege mail ko send krene ke liye 
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            }
          })
        // send mail with defined transport object
        // yeha hum mail bhej rahe hai
          let info = await transporter.sendMail({
            from: "Subodhit Chouhan - StudyNotion" , // sender address
            to: `${email}`, 
            subject: `${title}`, 
            html: `${body}`, // plain text body
          });

            return info;
        
    } catch (error) {
        console.log("Error in mailSender", error.message);
    }
}

module.exports = mailSender;