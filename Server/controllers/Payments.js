const {instance} = require('../config/razorpay');
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose, Mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress")





// //RazorPay Payment Gateway Integration love babar class codes 

// //stept 1 -- capture the payment and create order 

// //capturePayment handler -->
// exports.capturePayment =  async (req,res) => {
      
//         //get userId and courseId 
//         const courseId = req.body;
//         const userId = req.user.id;

//         //Validation 
//        //Valid courseId 
//         if(!course_id) {
//             return res.json({
//                 success:false,
//                 message:'Please provide valid course ID',
//             })
//         };

//         //valid courseDetail 

//     let courseDetails;
//     try {

//         //If you pass a string that represents a valid MongoDB ObjectId, Mongoose will automatically convert it to a proper ObjectId type internally. 
//         //So, whether you pass a string or a MongoDB ObjectId as the first argument, Mongoose will handle it correctly, 
//         //and the findById() method will work as expected.
//          courseDetails = await Course.findById(courseId);

//         if(!courseDetails){
//             return res.json({
//                 success:false,
//                 message:'Could not find the course',
//             });
//         }
        
//          //user already pay for the same course (i.e = check if user have already purchased the same course )

//         //The reason why it appears as a string in the payload object and not as an 
//         //ObjectId is that the JWT library serializes the payload data into a JSON format before signing it. 
//         //During this serialization process, 
//         //special types like ObjectId are converted to plain JSON data, and the original ObjectId type information is lost.
//         //Since the payload data was originally serialized to JSON and then deserialized during verification,
//         //the id property will be a string at this point.
//         const uid = new mongoose.Types.ObjectId(userId);   ////converting the userid from string to objectid

//         //includes() to check if a value exists in the array, it performs a strict equality comparison (===) for each element in the array. 
//         if(courseDetails.studentsEnrolled.includes(uid)){
//             return res.status(200).json({
//                 success:false,
//                 message:'Student is already enrolled',
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message,
//         });
//     }
//          //order create 
//     try {
//         const paymentResponse = await instance.orders.create({    //creating the order
//             amount: courseDetails.price *100,   // amount in paise (Razorpay works in paise, so we multiply by 100)
//             currency:'INR',                //currency for the payment
//             receipt: Math.random(Date.now()).toString(),  //receipt is a unique identifier for the payment
//             notes:{       //notes is the additional information that you can pass along with the order
//                 userId,   //here we are passing the userId and courseId as notes
//                 courseId
//             }
//         })
//         //return response
//         return res.status(200).json({
//             success:true,
//             courseName:courseDetails.courseName,
//             courseDescription:courseDetails.courseDescription,
//             thumbnail: courseDetails.thumbnail,
//             orderId: paymentResponse.id,
//             currency:paymentResponse.currency,
//             amount:paymentResponse.amount,
//         });

//         //handle error
//     } catch (error) {
//         console.log(error);
//         res.json({
//             success:false,
//             message:"Could not initiate order",
//         });
//     }
// }

// //verify (Signature ) payment of RazorPay and Sever

// //verifySignature handler -->

// exports.verifySignature = async (req,res) => {
//     const webhookSecret = "123456789"   // this is the secret key that you have to set in your razorpay account, it is used to verify the signature of the payment

//     //Getting the signature stored at razorpay server 
//     const signature = req.headers["x-razorpay-signature"];

//     //Following are the steps to hash the secret key present at backend so that it can be compared with the one received from server
//     const shasum = crypto.createHmac("sha256", webhookSecret); //sha256 is the hashing algo  //Hmac -> hashed based message authentication code //sha -> secure hashing algorithm //hmac --> takes two things as a parameter 1.hashing algorithm which is used to hash secret key ..2.secret key 
//     shasum.update(JSON.stringify(req.body))  //now w'll convert this hmac object to string format
//     const digest = shasum.digest("hex");   //digest is the final output of the hashing algorithm, it is a string representation of the hash

//     //action item, the secret keys match, what next to be done
//     if(signature===digest){
//         console.log("Payment is Authorised");

//         ///now hat action //bacche ko course me enroll krwana hai 

//         //getting userId and courseId from the razorpay req 
//         const {userId, courseId} = req.body.payload.payment.entity.notes;

//         try { 

//             //here we will enroll the student in the course by adding the userId to the studentsEnrolled array of the course document
//             const updatedCourse = await Course.findByIdAndUpdate(courseId, 
//                                                             {
//                                                                 $push:{
//                                                                     studentsEnrolled:userId   //here we are using $push operator to add the userId to the studentsEnrolled array of the course document
//                                                                 }
//                                                             }, 
//                                                             {new:true});
//             //validation
//             if(!enrolledCourse) {
//                 return res.status(500).json({
//                     success:false,
//                     message:'Course not Found',
//                 });
//             }
//            //here we will enroll the student in the course by adding the courseId to the courses array of the user document
//             const updatedStudent = await User.findByIdAndUpdate(userId, 
//                 {
//                     $push:{
//                         courses:courseId     //here we enrolling the user in the course by adding the courseId to the user's courses array
//                     }
//                 },
//                 {new:true})
//              //here we are sending the email to the user to notify that the course has been successfully purchased
//             const emailResponse = await mailSender(
//                                                     updatedStudent.email,
//                                                     "Thankyou for buying - StudyNotion",
//                                                     "You have successfully bought Study Notion Course"
//             )
//               //return success response 
//             console.log(emailResponse);
//                 return res.status(200).json({
//                     success:true,
//                     message:"Signature Verified and COurse Added",
//                 });
//         //handle error
//         } catch (error) {
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
//     }
//     //if the signature does not match, then return error response
//     else{
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         });
//     }
// }











//RazorPay Payment Gateway Integration github me jisne banaya hai ouska code 

//stept 1 -- capture the payment and create order 

//capturePayment handler -->
exports.capturePayment = async (req, res) => {

    //get userId and courseId 
    const {courses} = req.body;
    const userId =  req.user.id;
    //Validation 
     // Valid courseId 
    // if (courses.length === 0)
        if (!Array.isArray(courses) || courses.length === 0) {
        return res.json({
            success:false,
            message:"Provide courseId"
        })
    }
    
    //valid courseDetail
    let totalAmount = 0;

    for (const courseId of courses){
        let course;
        try {
            
            course = await Course.findById(courseId);
            if(!course){
                return res.status(200).json({
                    success:false,
                    message:"Course doesn't exist"
                })
            }
           
            //user already pay for the same course (i.e = check if user have already purchased the same course )

            const uid = new mongoose.Types.ObjectId(userId); //converting the userid from string to objectid
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"User already registered"
                })
            }
           
            //order create 
            totalAmount += parseInt(course.price);   //adding the price of the course to the total amount
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }
    
    console.log("The amount in capturePayment is", totalAmount)
    const currency = "INR"      // currency for the payment
    const options = {           //creating the options for the payment
        amount: totalAmount * 100,    // amount in paise (Razorpay works in paise, so we multiply by 100)
        currency,
        receipt: Math.random(Date.now()).toString()   //receipt is a unique identifier for the payment
    }

    //now we will create the order using the Razorpay instance
    try {
        //initiate the payment using Razorpay 
        const paymentResponse = await instance.orders.create(options)   //creating the order

        //return response 
        res.json({
            success:true,
            message: paymentResponse
        })
        //catch error 
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, mesage:"Could not Initiate Order"});
    }
}

//verify (Signature ) payment of RazorPay and Sever

//verifyPayment handler -->
exports.verifyPayment = async (req,res) => {
    console.log("request in verifyPayment is", req)
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature || !courses || !userId) {
            return res.status(200).json({success:false, message:"Payment Failed"});
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
                                    .update(body.toString())
                                    .digest("hex")

    if (expectedSignature === razorpay_signature) {
        
        await enrollStudents(courses, userId, res);

        return res.status(200).json({success:true, message:"Payment Verified"});
    }
    return res.status(200).json({success:"false", message:"Payment Failed"});
}

const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res.status(400).json({success:false,message:"Please Provide data for Courses or UserId"});
    }

    for(const courseId of courses) {
        try {
            const updatedCourse = await Course.findByIdAndUpdate(courseId,
                {
                    $push: {
                        studentsEnrolled: userId
                    }
                }, {new:true})  

            if (!updatedCourse) {
                return res.status(500).json({success:false,message:"Course not Found"});
            }

            const courseProgress = await CourseProgress.create({
                courseID:courseId,
                userId:userId,
                completedVideos: [],
            })

            const updatedStudent = await User.findByIdAndUpdate(userId, {
                $push: {
                    courses: courseId,
                    courseProgress: courseProgress._id,
                }
            }, {new: true})

            const emailResponse = await mailSender(
                updatedStudent.email,
                `Successfully Enrolled into ${updatedCourse.courseName}`,
                courseEnrollmentEmail(updatedCourse.courseName, `${updatedStudent.firstName}`)
            )
        } catch (error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }
}

exports.sendPaymentSuccessEmail = async (req,res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({success:false, message:"Please provide all the fields"});
    }

    try {
        const user = await User.findById(userId);
        await mailSender(
            user.email,
            `Payment Received`,
            paymentSuccessEmail(`${user.firstName}`,
             amount/100,orderId, paymentId)
        )
    } catch (error) {
        console.log("error in sending mail", error)
        return res.status(500).json({success:false, message:"Could not send email"})
    }
}

















