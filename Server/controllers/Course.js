const User = require('../models/User');
const Course = require('../models/Course')
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const Category = require('../models/Category');
const {uploadImageToCloudinary} = require('../utils/imageUploader')
require('dotenv').config();
const CourseProgress = require("../models/CourseProgress")
const {convertSecondsToDuration} = require("../utils/secToDuration");

//create course --> handler function 
exports.createCourse = async (req,res) => {
    try {
         //fetch data from req ki body 
        const{courseName, courseDescription, whatWillYouLearn, price, category,tags,status, instructions } = req.body;
         //get thumbnail
        const thumbnail = req.files.thumbnailImage;
        console.log("Thumbnail in course creation is", thumbnail)

        //Validation -->
        if(!courseName || !courseDescription || !whatWillYouLearn || !price || !category || !thumbnail || !status || !instructions) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        
        // check for the Instructor //check krege instructor hai ki nhi   
        const instructorId = req.user.id;    // req mesee instructor ki user id nickalwayege  
        const instructorDetails = await User.findById(instructorId);  // yeha pr humne instructor ki object id nickal li //jb hum naya course banayege tb hume instructor ki object id deni padegi 
        console.log("Instructor Details ", instructorDetails);
        
        //validate  -> instructor details
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"all fields are required "
            });
        }

        // check the given tag/category is valid or not  
        const categoryDetails = await Category.findById(category);  // instructor ki sari details nickal lenge using findById function 
        
        //Validation -->       
        if(!categoryDetails) {
            return res.status(404).json({
                success:false,
                message:'Category Details not found',
            });
        }
       
        //upload image to cloudinary 
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        
        //Create an entry for the new course 
        //yeha prr hum naye course ke ander sari ki sari entries create krdi 
        const newCourse = await Course.create({   
            courseName,
            description:courseDescription,
            whatWillYouLearn,
            price,
            thumbnail:thumbnailImage.secure_url,
            category,
            instructor:instructorId,   //yeha prr deni thi issliye humne instructor ki user id nickali thi  // jb bhi aap koi course banate ho aapko instructor batana hota hai .. instructor ki object id deni hoti hai  
            tags,
            status,
            instructions
        })


        //add a new course to the user schema of instructor    //naye course ko particular instructor wale course wale array me add krdiya hai !!
        await Category.findByIdAndUpdate(category,
            {
                $push: {     //push krdega mtlbb // courses wale array ke ander new course ko daal dega ... 
                    course: newCourse._id 
                }
            })
       
         // upadate the tag/category  ka the schema    
        await User.findByIdAndUpdate(instructorId, {
            $push: {
                courses: newCourse._id
            }})

            //return response
        return res.status(200).json({
            success:true,
            message:'Course created successfully',
            newCourse
        })  

    } //Handle error   
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error: error.message,
        })
    }
}

//get all courses or show all courses   --> Handler 

exports.showAllCourses = async (req,res) => {
    try {  //to show all the courses we use find function 

        const allCourses = Course.find({}, {        // find function sare courses ko dikha dega aur kuch essential details show krne bolega  
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnroled: true,
        }).populate("instructor").exec(); 

        //return response 
        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to show all Courses',
            error: error.message,
        })
    }
}

//getCourseDetails --> Handler function this will show the details of a particular course
exports.getCourseDetails = async (req, res) => {
  try {
    //get id
    const {courseId} = req.body;
    //find course details
    const courseDetails = await Course.findById(courseId)    //this will find course by course id 
                                .populate(                   //this will populate means it will fetch the details of the instructor and other details related to the course
                                    {
                                        path:"instructor",
                                        populate:{
                                            path:"additionalDetails",
                                        },
                                    }
                                )
                                .populate("category")
                                .populate("ratingAndReviews")
                                .populate({
                                    path:"courseContent",
                                    populate:{
                                        path:"subSection",
                                        //select: "-videoUrl",
                                    },
                                })
                                .exec();

        //validation
        if(!courseDetails) {
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            });
        }

        //padhaya nhi hai yee 


     let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)    //ye function humne utils me secToDuration.js me likha hai 






        //return response
        return res.status(200).json({
            success:true,
            message:"Course Details fetched successfully",
            data:{courseDetails,
              totalDuration
            },
        })

  }  //handle error 
  catch(error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:error.message,
      });
  }
}

///commented code abhi nhi bataya hai yeee 


exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          course[key] = updates[key]
          // if (key === "tag" || key === "instructions") {
          //   course[key] = JSON.parse(updates[key])
          // } else {
          //   course[key] = updates[key]
          // }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails", 
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  // Get a list of Course for a given Instructor
  exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 }).populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }
  // Delete the Course
  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
      

      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }