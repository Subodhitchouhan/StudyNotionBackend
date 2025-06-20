const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");

//createRating --> Handler function to create a rating and review for te course 
exports.createRating = async (req, res) => {
    try{

        //get user id
        const userId = req.user.id;
        //fetch data from req body
        const {rating, review, courseId} = req.body;
        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
                                    {_id:courseId,
                                    studentsEnrolled: {$elemMatch: {$eq: userId} },   //$elemMatch is used to check if userId exists in studentsEnrolled array & $eq is used to check for equality
                                });
        //if user is not enrolled in the course, return error
        if(!courseDetails) {
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course',
            });
        }
        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                user:userId,
                                                course:courseId,
                                            });
        if(alreadyReviewed) {
                    return res.status(403).json({
                        success:false,
                        message:'Course is already reviewed by the user',
                    });
                }
        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                        rating, review, 
                                        course:courseId,
                                        user:userId,
                                    });
       
        //update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push: {
                                            ratingAndReviews: ratingReview._id,
                                        }
                                    },
                                    {new: true});
        console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    } 
    //handle error 
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//getAverageRating --> Handler function to get the average rating of a course
exports.getAverageRating = async(req,res) => {

    try {

        //get courseId from request body
        const {courseId} = req.body;
         //calculate average rating using aggregation framework 
        const result = await RatingAndReview.aggregate([     //aggregation framework is used to perform complex queries on the database //syntax: Model.aggregate([ { $match: { ... } }, { $group: { ... } } ])
            {
                $match: {
                    course:courseId         //match the courseId with the course field in the RatingAndReview collection
                }
            },
            {
                $group:{                                 //group the documents by courseId
                    _id:null,                          //id is set to null because we want to calculate the average rating for all the documents that match the courseId
                    averageRating : {$avg :rating}    //calculate the average rating of the course
                }
            }
        ])  
      //this will return the arrray of the ratings // uperr wale result me humko entire ek hi value milegi in the form of array jo ki hogi averageRating 

        //return rating 
        if (result.length>0) {      //if result.length is greater then 0 it means there is rating present 
            return res.status(200).json({
                success:true,
                message:'Avg rating recived for the course',
                averageRating: result[0].averageRating    //this will return avg rating 
            })
        } 
        //if length of the result is less then 0 
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no ratings given till now',
            averageRating:0,
        })
        //handle error 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


//getAllRating --> Handler function to get all the ratings and reviews of a course
exports.getAllRating = async (req, res) => {
    try{     
             //fetch all the ratings and reviews from the database
            //sort them in descending order of rating
            //populate user and course details
            //populate user details with firstName, lastName, email and image
            //populate course details with courseName
            const allReviews = await RatingAndReview.find({}) 
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select: "courseName",
                                    })
                                    .exec();   //execute query 

             //return response with all reviews                        
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
    }   //handle error 
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}