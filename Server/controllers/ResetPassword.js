const User = require("../models/User")
const crypto = require('crypto')
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt')

//Reset password token
exports.resetPasswordToken = async (req,res) => {

   try { //get email from req body 
       const {email} = req.body;
         //validate email  // check if email is empty // aur email is verified 
       if(!email){
           return res.status(400).json({
               success:false,
               message:"Email is empty"
           })
       }
        // check for the existing user with the email
       const existingUser = await User.findOne({email})
        //if user not exists return response 
       if(!existingUser){
           return res.status(400).json({
               success:false,
               message:"Email doesn't exist"
           })
       }
         //if user exists then generate a token and send the mail   // here we are using crypto module to generate a random token // this will generate a random uid
         //Generate token  
       const token = crypto.randomUUID()
       //update user by adding token and and expiration time (resetPasswordExpires)
       const updatedUser = await User.findOneAndUpdate({email},     //ye findOneAndUpdate function hai jo user ko email ki madad se dhundega then ousko update krega 
                                                    {
                                                    token:token,      // token ko update krega // token ko email ke sath match karke update krega
                                                    resetPasswordExpires: Date.now() + 5*60*1000    // 5 minutes   // ye token 5 minutes ke liye valid hoga
                                                    },
                                                    {new:true}) 
       
       
       //create url (link) for the reset password page     // this is frontend link // ye link frontend ka hai jo user ko bhejna hai                                  
       const url = `http://localhost:3000/update-password/${token}`

       //send mail containing the url too the user
       // ye mailSender function hai jo mail bhejega user ko // ye function utils folder me hai
       await mailSender(email, "Password Reset Link", `Password reset link: ${url}`);

       //return response 
       return res.status(200).json({
           success:true,
           message:'Reset link sent'
       })
   } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })
   }
}


//Reset password handler 
exports.resetPassword = async (req,res) => {

    try { 
        // fetch data from req ki body   // ye data frontend se aayega // ye data reset password page se aayega
         const {token, password, confirmPassword} = req.body;     
        //validation of the data 
        if(!token||!password||!confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Enter all details"
            })
        }
        // Get user details from db using token 
        const existingUser = await User.findOne({token:token});   //token ke addhar prr aap user details ko fetch krke laaoge 
        //if no entry - Invalid token 
        if(!existingUser) {
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }
        //if token time check 
        if(existingUser.resetPasswordExpires<Date.now()){    // ye check karega ki token ki expiry time ho gayi hai ya nahi // mtlb current time se token ki expiry time choti hai ya nahi  // kyuki expire hone ke baad current time wo jayada hojyega expiry te se 
            return res.status(500).json({
                success:false,
                message:"Token is no longer valid"
            })
        }
         
        //if password and confirm password are not same
        //validation 
        if (password!==confirmPassword) {
            return res.status(500).json({
                success:false,
                message:"Password Don't match"
            })
        }
           
        //hashing the password using bcrypt
        const hashedPwd = await bcrypt.hash(password, 10);
        //update the password in db
        const updatedUser = await User.findOneAndUpdate({token},      // ye token ko dhundega // token ko email ke sath match karke update krega
                                                        { password:hashedPwd},  // password ko update krega // password ko email ke sath match karke update krega
                                                        {new:true})                 //ye new:true hai jo updated user ko return krega // ye new:true hai jo updated user ko return krega
        
        console.log("Updated user after password change is", updatedUser)
        //return response 
        return res.status(200).json({
            success:true,
            message:"Password Changed successfully"
        })

    } 
    
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while reseting password'
        })
    }
}