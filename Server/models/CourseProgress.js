const mongoose =  require('mongoose');

const courseProgressSchema = new mongoose.Schema({
    courseID:{
        type:mongoose.Schema.Types.ObjectId, 
        ref: "Course",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    completedVideos:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref: "SubSection",
    }],


})

module.exports = mongoose.model("CourseProgress", courseProgressSchema);  // name of this model is CourseProgress and the schema is courseProgressSchema