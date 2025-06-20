const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require('../models/SubSection');


// Create a new section and add it to the course
exports.createSection = async (req,res) => {
    try {
         //data fetch from forntend 
        const {courseId, sectionName} = req.body;
         //data validation 
        if(!courseId || !sectionName) {
            return res.status(400).json({
                success:false,
                message:'All fields are required', 
            });
        }
        //create a new section
        const newSection = await Section.create({sectionName});
        //Update the course with section object id 
        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
                                                                          $push: {
                                                                            courseContent:newSection._id  //course content is an array of section ids
                                                                          }  
                                                                        }, {new:true})             //new:true options returns the updated document 
                                                                        .populate({               //populate method is used to replace the specified path in the document with the documents from other collection 
                                                                            path:"courseContent",   
                                                                            populate: {
                                                                                path:"subSection"
                                                                            }});

        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            newSection,
            updatedCourse
        })   
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create Section',
            error: error.message,
        })
    }
}

//updateSection handler --> Update an exisiting section 

exports.updateSection = async (req,res) => {
    try {
         
        //data fetch 
        const {sectionId, sectionName, courseId} = req.body;
        //data validation 
        if (!sectionId || !sectionName) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        //Update the data 
        const updatedSection = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true}); //new:true options returns the updated document
        const updatedCourse = await Course.findById(courseId)
          .populate({
              path:"courseContent",
              populate: {
                  path:"subSection"
              }});

        //return successful response 
        return res.status(200).json({
            success:true,
            message:'Section updated successfully',
            updatedCourse
        })   
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to update Section',
            error: error.message,
        })
    }
}


//deleteSection handler --> Delete an exisiting section
exports.deleteSection = async (req,res) => {
    try {
        
        //Get ID - assuming that we are sending id in the params 
        const {sectionId, courseId} = req.body;
        // data validation 
        if (!sectionId) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
       // Use findByIdAndDelete
        const sectionDetails = await Section.findById(sectionId);
        
        // //Section ke ander ke subsections delete kiye hai 
        // sectionDetails.subSection.forEach( async (ssid)=>{
        //     await SubSection.findByIdAndDelete(ssid);
        // })
        // console.log('Subsections within the section deleted')
        // //NOTE: Due to cascading deletion, Mongoose automatically triggers the built-in middleware to perform a cascading delete for all the referenced 
        // //SubSection documents. DOUBTFUL!

        // //From course, courseContent the section gets automatically deleted due to cascading delete feature
        // await Section.findByIdAndDelete(sectionId);
        // console.log('Section deleted')

        // const updatedCourse = await Course.findById(courseId)
        //   .populate({
        //       path:"courseContent",
        //       populate: {
        //           path:"subSection"
        //       }});

        //return sucessfull response
        return res.status(200).json({
            success:true,
            message:'Section deleted successfully',
            updatedCourse
        })   
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to delete Section',
            error: error.message,
        })
    }
}

