const User = require('../models/User');
const Profile = require("../models/Profile");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
//-const { convertSecondsToDuration } = require("../utils/secToDuration");
//const {convertSecondsToDuration} = require("../utils/secToDuration");
const { convertSecondsToDuration } = require("../utils/secToDuration");

//updateProfile handler --> in thsi we already create a null profile containing several parameters and then update it acc to req 
exports.updateProfile = async (req,res) =>{
    try {
        //Get data 
        const {dateOfBirth="", gender, about="", contactNumber } = req.body;
        //Get user id 
        const userId = req.user.id
        //Validation 
        if(!contactNumber || !gender ) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        } 
        //Find profile
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;

       //update profile
        const updatedProfile = await Profile.findByIdAndUpdate(profileId, {dateOfBirth, gender, about, contactNumber}, {new:true});
        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:'Profile updated successfully',
            updatedUserDetails
        })   
        //handle error
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to update profile',
            error: error.message,
        })
    }
}

// deleteAccount handler --> delete the user account and profile
exports.deleteAccount = async (req,res) =>{
    try {
        //get user id from req body
        const {user} = req.body
        const userId = req.user.id

        //vallidation not neccessary but still doing
        const userDetails = await User.findById(userId);
        // if(!userDetails) {
        //     return res.status(404).json({
        //         success:false,
        //         message:'User not found',
        //     });
        // }         
         
        //delete user profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        //TOOD: HW unenroll user form all enrolled courses
        //delete user
        await User.findByIdAndDelete({_id:userId});
        
        //return response
        return res.status(200).json({
            success:true,
            message:'User deleted successfully',
        })  
        //handle error  
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to delete User',
            error: error.message,
        })
    }
}

//getAllUserDetails handler --> get all user details including profile details
exports.getAllUserDetails = async (req,res) =>{
       try {
        //get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();   // populate the additionalDetails field with Profile details
        //return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            userDetails
        });
       
    } //handle errror
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

//these all are commented kyuki abhi ek isme changes nhi kiye hai testing ke liye me ye sare uncomment krr rha hun 

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
// exports.getEnrolledCourses = async (req, res) => {
//     try {
//       const userId = req.user.id
//       let userDetails = await User.findOne({
//         _id: userId,
//       })
//       .populate({
//         path: "courses",
//         populate: {
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//         },
//       })
//       .exec()



     //chatgpt code
        // exports.getEnrolledCourses = async (req, res) => {
        //   try {
        //     const userId = req.user.id;

        //     let userDetails = await User.findOne({ _id: userId })
        //       .populate({
        //         path: "courses",
        //         populate: {
        //           path: "courseContent",
        //           populate: {
        //             path: "subSection",
        //           },
        //         },
        //       })
        //       .exec();

        //     if (!userDetails) {
        //       return res.status(404).json({
        //         success: false,
        //         message: `Could not find user with id: ${userId}`,
        //       });
        //     }

        //     userDetails = userDetails.toObject();
        //     console.log("Fetching enrolled courses for user:", userId);








//     //  userDetails = userDetails.toObject()
// 	  var SubsectionLength = 0
// 	  for (var i = 0; i < userDetails.courses.length; i++) {
// 		let totalDurationInSeconds = 0
// 		SubsectionLength = 0
// 		for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
// 		  totalDurationInSeconds += userDetails.courses[i].courseContent[
// 			j
// 		  ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
// 		  userDetails.courses[i].totalDuration = convertSecondsToDuration(
// 			totalDurationInSeconds
// 		  )
// 		  SubsectionLength +=
// 			userDetails.courses[i].courseContent[j].subSection.length
// 		}
// 		let courseProgressCount = await CourseProgress.findOne({
// 		  courseID: userDetails.courses[i]._id,
// 		  userId: userId,
// 		})
// 		courseProgressCount = courseProgressCount?.completedVideos.length
// 		if (SubsectionLength === 0) {
// 		  userDetails.courses[i].progressPercentage = 100
// 		} else {
// 		  // To make it up to 2 decimal point
// 		  const multiplier = Math.pow(10, 2)
// 		  userDetails.courses[i].progressPercentage =
// 			Math.round(
// 			  (courseProgressCount / SubsectionLength) * 100 * multiplier
// 			) / multiplier
// 		}
// 	  }

//       if (!userDetails) {
//         return res.status(400).json({
//           success: false,
//           message: `Could not find user with id: ${userDetails}`,
//         })
//       }
//       return res.status(200).json({
//         success: true,
//         data: userDetails.courses,
//       })
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       })
//     }
// };


////corrected code 

    exports.getEnrolledCourses = async (req, res) => {
      try {
        const userId = req.user.id;
        console.log("Fetching enrolled courses for user:", userId);

        let userDetails = await User.findOne({ _id: userId })
          .populate({
            path: "courses",
            populate: {
              path: "courseContent",
              populate: {
                path: "subSection",
              },
            },
          })
          .exec();

        // ✅ Check if user was not found
        if (!userDetails) {
          return res.status(404).json({
            success: false,
            message: `User not found with id: ${userId}`,
          });
        }

        userDetails = userDetails.toObject();

        let SubsectionLength = 0;

        for (let i = 0; i < userDetails.courses.length; i++) {
          let totalDurationInSeconds = 0;
          SubsectionLength = 0;

          for (let j = 0; j < userDetails.courses[i].courseContent.length; j++) {
            const subSections = userDetails.courses[i].courseContent[j].subSection;

            totalDurationInSeconds += subSections.reduce(
              (acc, curr) => acc + parseInt(curr.timeDuration || 0),
              0
            );

            SubsectionLength += subSections.length;
          }

          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          );

          let courseProgress = await CourseProgress.findOne({
            courseID: userDetails.courses[i]._id,
            userId: userId,
          });

          const completedVideosCount = courseProgress?.completedVideos?.length || 0;

          // Handle progress calculation
          userDetails.courses[i].progressPercentage =
            SubsectionLength === 0
              ? 100
              : Math.round(
                  (completedVideosCount / SubsectionLength) * 100 * 100
                ) / 100; // round to 2 decimal places
        }

        // ✅ Return enrolled courses
        return res.status(200).json({
          success: true,
          data: userDetails.courses,
        });
      } catch (error) {
        console.error("Error in getEnrolledCourses:", error);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
      }
    };
















exports.instructorDashboard = async(req, res) => {
	try{
		const courseDetails = await Course.find({instructor:req.user.id});

		const courseData  = courseDetails.map((course)=> {
			const totalStudentsEnrolled = course.studentsEnrolled.length
			const totalAmountGenerated = totalStudentsEnrolled * course.price

			//create an new object with the additional fields
			const courseDataWithStats = {
				_id: course._id,
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				totalStudentsEnrolled,
				totalAmountGenerated,
			}
			return courseDataWithStats
		})

		res.status(200).json({courses:courseData});

	}
	catch(error) {
		console.error(error);
		res.status(500).json({message:"Internal Server Error"});
	}
}