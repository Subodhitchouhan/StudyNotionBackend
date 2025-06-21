
//taking instance of the express server and creating the web app
const express = require("express");
const app = express();
//importing all the routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

//imprting all the essential connections 
const database = require("./config/database");  //database connection
const cookieParser = require("cookie-parser");  //cookie parser for cookies
const cors = require("cors");   //cors for cross-origin resource sharing //hum chahte hai ki humari local machine prr humahra humara frontend hosted ho port no 3000 and backend on 4000 so we need cors //me chahta hum mera backend jo hai frontend ki req ko enterain kre 
const {cloudinaryConnect } = require("./config/cloudinary");  //cloudinary connection for image upload
const fileUpload = require("express-fileupload"); //file upload for file upload
const dotenv = require("dotenv"); //dotenv for environment variables

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connectDB();
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "https://inspiring-clafoutis-90322e.netlify.app/", //frontend url   //yeha hum cors ko set krr rhe hai taki humara frontend jo hai wo backend ki req ko enterain kre
		credentials: true,
	})
)
// app.use((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	next();
//   });
app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);


//default route
//home route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

//activate the server
app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})

