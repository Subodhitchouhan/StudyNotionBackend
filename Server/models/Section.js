const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
    
    sectionName: {
        type:String,
    },
    subSection: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection",    
        }
    ],


});

module.exports = mongoose.model("Section", sectionSchema);   // name of this model is Section and the schema is sectionSchema