const Category = require('../models/Category');
const Course = require('../models/Course')
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }


 //create category handler ka function    (tag ka handler function)
  exports.createCategory = async (req,res) =>{
    try {
        //get data from req ki body 
        const {name, description} =  req.body;
        
        //Validation krege 
        if(!name || !description){
            return res.status(401).json({
                success:false,
                message:"category name or description not available"
            })
        }
      // create entry in DB 
        const newCategory = await Category.create({    //this will create a new document name newcategory  // jisme name me nam daaldenge aur description me description 
            name,
            description
        })
         //Validation -> checks newcategory is empty ... if it is then return response 
        if (!newCategory) {
            return res.status(401).json({
                success:false,
                message:"Error in pushing new tag to db"
            }) 
        }
        // return successful response 
        return res.status(200).json({
            success:true,
            message:"category created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


// showAllCategories -> handler function
exports.showAllCategories = async (req,res) => {

    try {
        //find function ka usse krke sare tags/category nickal lo 
        const allCategories =  await Category.find({}, {name:true, description:true});  //category.find({}) this will find all the categories of the courses ... {name:true, description:true} and naam aur description ousme hone chahiye 
        
            //return successfull response .. // and display all categories 
            return res.status(200).json({
                success:true,
                message:"All tags received",
                data:allCategories
            })  
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// categoryPageDetails -> handler function //1.particular course category ke sare courses 2.other courses  3. most purchased course 
exports.categoryPageDetails = async (req,res) => {
    try { 
         //get categoryId
        const { categoryId } = req.body
      console.log("PRINTING CATEGORY ID: ", categoryId);
      // Get courses for the specified category
      const selectedCourses = await Category.findById(categoryId)
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
  
      //console.log("SELECTED COURSE", selectedCourses)
      // Handle the case when the category is not found
      if (!selectedCourses) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      if (selectedCourses.course.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
        course: { $not: { $size: 0 } }
      })
      console.log("categoriesExceptSelected", categoriesExceptSelected)
      let differentCourses = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
        //console.log("Different COURSE", differentCourses)
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)   //in this line we are flattening the array of courses from all categories into a single array //flatMap is used to flatten the array of courses from all categories into a single array
      const mostSellingCourses = await Course.find({ status: 'Published' })    //in this line we are finding all the courses which are published
      .sort({ "studentsEnrolled.length": -1 }).populate("ratingAndReviews") // Sort by studentsEnrolled array length in descending order
      .exec();
          
        //return response with selected courses, different courses, and most selling courses
        res.status(200).json({
			selectedCourses: selectedCourses,
			differentCourses: differentCourses,
			mostSellingCourses,
            name: selectedCourses.name,
            description: selectedCourses.description,
            success:true
		})
        //handle error 
    } catch (error) {
        return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
}