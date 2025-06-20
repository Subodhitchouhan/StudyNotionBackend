const SubSection = require('../models/SubSection');
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


//createSubSection handler --> Create a new subsection and add it to the section
exports.createSubSection = async (req,res) =>{
    try {

        //data fetch from req ki body 
        const {sectionId,title, timeDuration, description } = req.body;
        //extract file/video 
        const video  = req.files.video;
        //data validation
        if(!sectionId || !title || !description || !video) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
         //create a new sub-section
        const newSubSection = await SubSection.create({
            title,
            timeDuration: `${uploadDetails.duration}`,
            description,
            videoUrl:uploadDetails.secure_url
        })
         //update the section with the new sub-section id
        const updatedSection = await Section.findByIdAndUpdate(sectionId, { $push: {subSection: newSubSection._id}},{new:true}).populate("subSection");   // populate method is used to replace the specified path in the document with the documents from other collection
         //return success response
        return res.status(200).json({
            success:true,
            message:'SubSection created successfully',
            updatedSection
        })  
        //handle error  
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create SubSection',
            error: error.message,
        })
    }
}


//updateSubSection handler --> Update an existing subsection

exports.updateSubSection = async (req, res) => {
    try { 
        //data fetch from req body
      const { sectionId,subSectionId, title, description } = req.body
       //subSectionId is the id of the subsection to be updated
      const subSection = await SubSection.findById(subSectionId)
        //data validation
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
      //this will update the title, description and videoUrl of the subsection
      //update the subsection with the new data 
      if (title !== undefined) {    // If title is provided, update it
        subSection.title = title
      }
      // If description is provided, update it
      if (description !== undefined) {
        subSection.description = description
      }
      // If a new video file is provided, upload it to Cloudinary and update the videoUrl and timeDuration
      if (req.files && req.files.video !== undefined) {   //if files & video is provided, upload it to cloudinary
        const video = req.files.video   // Extract the video file from the request
        const uploadDetails = await uploadImageToCloudinary(   //upload the video to cloudinary
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url    // Update the videoUrl with the uploaded video's URL
        subSection.timeDuration = `${uploadDetails.duration}`  // Update the timeDuration with the uploaded video's duration
      }
  
      await subSection.save()   // Save the updated subsection to the database
  
      const updatedSection = await Section.findById(sectionId).populate("subSection") // Populate the section with the updated subsection data

      //return success response
      return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }

  //deletesubsection
exports.deleteSubSection = async (req,res) =>{
    try {
         //data fetch from req body
        const {subSectionId,sectionId } = req.body;
        //find the section by sectionId and pull the subSectionId from the subSection array
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
              $pull: {
                subSection: subSectionId,
              },
            }
          )
          //data validation
        if(!subSectionId) {
            return res.status(400).json({
                success:false,
                message:'SubSection Id to be deleted is required',
            });
        }
        
        //delete the subsection by using findByIdAndDelete
        //find the subsection by subSectionId and delete it
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId }) 
       //check if subsection is deleted or not
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
       
      //find the section by sectionId and populate the subSection array
      const updatedSection = await Section.findById(sectionId).populate("subSection") 
      
      //return the success response 
      return res.json({
        success: true,
        data:updatedSection,
        message: "SubSection deleted successfully",
      })

      //handler error
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to delete SubSection',
            error: error.message,
        })
    }
}