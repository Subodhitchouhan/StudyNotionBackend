const jwt = require("jsonwebtoken")



//1.auth        // Authentication middleware // isme hum token ko verify karte hai ki user ne login kiya hai ya nahi 

// Isme hum authentication check krte hai ki 
// authenication check krne ke liye hum JWT token ko verify krte hai ki  // ki jo aapne jwt token diya hai wo sahi h ya nhi hai // agar valid nhi hota tha toh hum bhaga dete the 
///JWT TOOKEN MILNE KE TEEN TARIKE THE 
//1. req.body.token               // not recommended
//2. req.cookies.token
//3. req.get("Authorization")?.replace("Bearer ", "")  // ye humara header se milta hai   // safest way hai  

exports.auth = async (req,res, next) => {

    try {
         
        //extract token from these methods 
        const token = req.body.token || req.cookies.token || req.get("Authorization")?.replace("Bearer ", "");
        //if token is missing then return response 
        if(!token) {
            return res.status(401).json({
                success:false,
                message:'TOken is missing',
            });
        }

        // verify the token                                              
        try {
            const payload = jwt.verify(token,process.env.JWT_SECRET);  //yeha hum token ko verify karte hai ki wo sahi hai ya nhi hai//
            req.user = payload;
        } catch (error) {
            // verification - issue 
            return res.status(401).json({
                success:false,
                message:"Invaild token."
            })
        } 
        next();   // next middleware pr chale jayege

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success:false,
            message:"Error in validating token"
        })
    }
}



// isStudent  -> middleware 

exports.isStudent = async(req,res,next) => {
    try{
        if(req.user.accountType !== "Student") {      //agar user ka account type student nahi hai toh hum bhaga dete hai
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Students only',
            });
        }
        next();  // call next middleware
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}


//isInstructor -> middleware

exports.isInstructor = async(req,res,next) => {
    try{
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Instructor only',
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}


//isAdmin -> middleware

exports.isAdmin = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Admin") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Admin only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }
