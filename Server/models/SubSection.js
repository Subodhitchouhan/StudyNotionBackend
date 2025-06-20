const mongoose =  require('mongoose');

const subSectionSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    timeDuration: {
        type: String,
    },
    description: {
        type:String,
    },
    videoUrl:{
        type:String,
    },


})

module.exports = mongoose.model("SubSection", subSectionSchema);   // name of this model is SubSection and the schema is subSectionSchema