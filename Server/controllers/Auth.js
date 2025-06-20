const OTP = require('../models/OTP');   // OTP model
const User = require('../models/User')  // User model
const otpGenerator = require('otp-generator')  // OTP generator
const bcrypt = require('bcrypt')  // Password hashing
const Profile = require('../models/Profile')  // Profile model
const jwt = require('jsonwebtoken')  // JWT for token generation


const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require('dotenv').config()

//sendOtp function - to send OTP to the user 

exports.sendOtp = async (req,res) => {
    try {
        //Fetching the email from the request body
        const {email} = req.body;
        console.log("Email in senOtp controller",email)

        //check if user is already exist 
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(401).json({
                success:false,
                message: "Email already exists"
            })
        }
       
        // generate OTP from this method 
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        
          //console.log("IOP GENERATED :",otp); 

        // check unique OTP or not   
        let result = await OTP.findOne({otp:otp});    /// hum yeha ye check krege ki generate kiya hua otp already db me present hai ki nhi !!

        while (result) {
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = OTP.findOne({otp:otp});
        }
        console.log("OTP generated", otp);   // yeha humko ek unique otp miljayega 

       // create an entry for OTP in the DB 
        const createdOtp = await OTP.create({
            email,
            otp
        })
      /// return the response successful 
        return res.status(200).json({
            success:true,
            message: "OTP created!",
            createdOtp
        })

        // if any error occur 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// ye otp generation wala bahut bekar code hai industry point of view se .. kyuki yeha hum db se loop me intraction krr rhe hai .. practically industry me aur bhi tarike hote hai jisse hum kaa code likhkr hi unique otp generate krr pate hai  


/// signup handler - 

exports.signUp = async (req,res) => {

    //Data Fetch from request ki body     /// ye sara data humne enter kiya hoga signup wale frontend page prrr 
    try {
        const {
            firstName, 
            lastName,
            email,
            password,
            confirmPassword,
            accountType, 
            otp, contactNumber
        } = req.body;
    
       // Validate krlo -  ( sara essential data present hona chahiye ) 

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message: "Fill all details"
            })
        }
    
        // pasword aur confirm password ko match kro -  (dekho ye dono same hai ki nhi hai )
        if(password!==confirmPassword){
            return res.status(403).json({
                success:false,
                message: "Passwords don't match"
            })
        }
      
       //check for the user is already exist or not  
        const existingUser = await User.findOne({email});
    
        if(existingUser){
            return res.status(401).json({
                success:false,
                message: "Email already exists"
            })
        }
     
        // find most recent OTP stored for the user 
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);  // enter email ke according sbse recent otp hum nickaleege // .sort({createdAt:-1}).limit(1);  -->  iss query se humne sort krliya hai ki jo humari sbse recent most value hogi hum ousko fetch krke le aayege .. based on creation time 
        console.log("Otp in signup page is:",recentOtp[0].otp)
        
        //Validate OTP     /// phir wo otp humare pass aaya ousko humne validate krwaya ki wo sahi otp h ki nhi or kahi empty tohh nhi hai  
        if (recentOtp.length == 0) {
            // if OTP not found 
            return res.status(400).json({
                success:false,
                message:'OTP Not Found',
            })
        }
          
        else if(otp !== recentOtp[0].otp){
            //invalid OTP 
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }
    
 
         //Hash Password -
        const hashedPwd = await bcrypt.hash(password, 10);
        
        let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);
        
         // create entry in DB 

        const profileDetails = await Profile.create({     //ek nayi profile banani padegi na toh ouske liye hai hum sari details ko empty mark krrdenge 
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumer:null,
        });
        
        console.log("Data received in signup is" ,firstName )
        const newUser = await User.create({
            firstName, 
            lastName,
            email,
            password: hashedPwd,
            accountType,
            approved: approved, 
            additionalDetails: profileDetails._id,   // ye object id hai  //hume additional details bhi daalni padegi ouske kliye humko profile id daalna padegi ouske liye humne ek empty profile banayi 
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`   //jb bhi koi person signup krega toh by default ouski profile pr ek image generate krdega ye api... using its fist nme and last name  ... jese mene subodhit chouhan naam se sign up kiya ..toh immage banegi SC naam se jesa gmail me hota hai right...
        })

        // return response 
        console.log("Data created successfully")
        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            newUser,
        });    

        // handle error 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registrered. Please try again",
        })
    }
}

//LOGIN HANDLER 

exports.login = async (req,res) => {
    try {

       //get data from request body //ye data humne login page pr enter kiya hoga
        const {email, password} = req.body;
       //validate data  // sara imp data enter kiya hai ki nhi wo check krege 
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'Email or Password empty',
            })
        }
        //check if user is already exist or not
        const existingUser = await User.findOne({email}).populate("additionalDetails").exec();  // ye findOne function check krega .. enter kri hui email db e already present hai ki nhi .. agar present hai toh hum populate function ka use krek ous email id ki sari details ko fetch krr lennge // .populate("additionalDetails")  // ye additionalDetails ki id ko fetch krr lega jo humne signup page pr create kiya tha
        
        // if user is not exist then return response to resgister first 
        if (!existingUser) {
            return res.status(400).json({
                success:false,
                message:'Email not registered',
            })
        }
         
        //Generate JWT Token , After pasword matching   
        // if user is exist then check for the password
        //compare password using bcrypt
        // ye password ko hash karke check krega ki jo humne password enter kiya hai wo db me stored password se match hota hai ki nhi
        // agar match hota hai toh hum user ko login krr denge
        // agar match nahi hota hai toh hum user ko error message de denge ki password galat hai
        if (await bcrypt.compare(password, existingUser.password)) {  // bcrypt ka compare function chalayege ek jo password humne enter kiya hai ui me wo aur ek jo db me stored password hai wo dono same hai ki nhi .. agar same hai toh ye krdo 
                
            //creating payload ..which is used for generating JWT token as parameter 
            const payload = {
                email:email,
                accountType: existingUser.accountType,
                id: existingUser._id
            }
            // creating JWT token 
            const token = jwt.sign(payload,process.env.JWT_SECRET, {   //jwt token create krrne ke liye hum jwt.sign function ka use krr rhe hai..isme parameter me payload pass krr rhe hai jo humne upar create kiya hai .. dusra parameter secret key hai jo humne env file me rakhi hai .. aur teesra parameter hai options jisme hum expiry time set krr rhe hai
                expiresIn: "2h"
            } )
    
            existingUser.toObject();  // ye function existingUser ko object me convert krr dega
            existingUser.token = token; // ye token ko existingUser object me daal dega
            existingUser.password = undefined; // ye password ko undefined krr dega taaki password kisi ko na dikhe

            //create cookie and send response 
            
            // creating options for cookie // ye options hai cookie ke liye ..options me hum expiry time set krr rhe hai aur httpOnly ko true krr de rhe hai taaki cookie sirf server se access ho sake
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }
          
            // ye cookie ko create krr dega aur usme token daal dega   // iske parameters me humne token daala hai jo humne upar create kiya hai .. dusra parameter hai options jisme hum expiry time set krr rhe hai aur httpOnly ko true krr de rhe hai taaki cookie sirf server se access ho sake
            return res.cookie("token", token, options).status(200).json({
                success:true,
                message:'Login successfull',
                token, 
                existingUser
            })
        } 
        // if password is not same means it is incorrect then return response
        else {
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }
    // if any error occur
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });
    }
}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);   //get uswer details using user id from token

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword } = req.body;   // ye data humne frontend pr enter kiya hoga

		// Validate old password
		const isPasswordMatch = await bcrypt.compare( oldPassword , userDetails.password );   // ye password ko hash karke check krega ki jo humne password enter kiya hai wo db me stored password se match hota hai ki nhi
		
          // if password would not match then return response
        if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		// if (newPassword !== confirmNewPassword) {
		// 	// If new password and confirm new password do not match, return a 400 (Bad Request) error
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: "The password and confirm password does not match",
		// 	});
		// }

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);   // ye password ko hash karke encrypt krr dega 
		const updatedUserDetails = await User.findByIdAndUpdate(                  //ye user ki id se user ko update krr dega
			req.user.id,                                                         // ye user ki id se user ko update krr dega
			{ password: encryptedPassword },                                    // ye password ko update krr dega
			{ new: true }                                                     // ye new option hai jo updated user details ko return krr dega
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(      //ye email bhejne ka function hai jo humne utils me banaya hai
				updatedUserDetails.email,                // ye email id hai jisko humne signup page pr enter kiya tha
				passwordUpdated(                         // ye email template hai jo humne mail templates me banaya hai
					updatedUserDetails.email,            // ye email id hai jisko humne signup page pr enter kiya tha
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}` // ye subject hai jo humne email template me daala hai
				)
			);
			console.log("Email sent successfully:", emailResponse.response);   // ye email bhejne ka response hai jo humne email bhejne ke function se liya hai
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};