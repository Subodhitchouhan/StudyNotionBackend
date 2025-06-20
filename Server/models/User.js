// creating model of the User


const mongoose =  require('mongoose');   // taking instance of the mongoose 

const userSchema = new mongoose.Schema({   // created a schema of the User model named userSchema 

    firstName:{
        type:String, 
        required:true,
        trim:true
    },

    lastName:{
        type:String, 
        required:true,
        trim:true
    },

    email:{
        type:String, 
        required:true,
        trim:true
    },

    password:{
        type:String, 
        required:true,
        trim:true
    },
    
    accountType:{
        type:String, 
        enum:["Student","Instructor","Admin"],     // enum is used to limit the values of the field  // in teen mese hi koi hoga account Type
        required:true,
    },

    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,     // reference to the Profile model
        ref:"Profile",                               // reference to the Profile model  // for more details
        required:true, //watch for this required or not
    },

    courses:[{
        type:mongoose.Schema.Types.ObjectId,  // reference to the Course model
        ref:"Course",     // reference to the Course model
    }],

    token:{    
        type: String 
    },

    resetPasswordExpires:{
        type: Date
    },

    image:{
        type:String,    // image ka type string issliye liya hai kyuki wo ek url hoga
        required:true
    },

    courseProgress:[{
        type:mongoose.Schema.Types.ObjectId,    // reference to the CourseProgress model
        ref:"CourseProgress"                //  reference to the CourseProgress model
    }],

    active: {
        type: Boolean,     // active field to check if the user is active or not
        default: true,
    },

    approved: {
        type: Boolean,   // approved field to check if the user is approved or not
        default: true,
    },

})

module.exports = mongoose.model("User", userSchema);    // name of this model is User and the schema is userSchema