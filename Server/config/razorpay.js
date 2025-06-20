//connectin with the razorpay API


const Razorpay = require ('razorpay')

exports.instance = new Razorpay({          //taking instance of the razor pay 
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
})