import { config } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { connection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRoutes.js";
import auctionItemRouter from "./router/auctionItemRoutes.js";
import bidRouter from "./router/bidRoutes.js";
import commissionRouter from "./router/commissionRouter.js";
import superAdminRouter from "./router/superAdminRoutes.js";
import { BidderWon } from "./automation/BidderWon.js";
import { PaymentSettled } from "./automation/Paymentsettled.js";


const app = express();  // creating an instance of express app


// Load environment variables from .env file to the whole application
config({
  path: "./.env",
});


// Configure CORS to allow requests from the frontend URL,means which frontend url is allowed to access the backend API and which methods are allowed
app.use(
  cors({
    origin:"http://localhost:5173", // taking array because we can have multiple frontend urls
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

// app.use(cors()); // Allow all origins temporarily



// Configure cookie parser to handle cookies in requests so that we can access cookies in the request object i.e for accessing frontend cookies in the backend
// This is used to parse cookies attached to the client request object
app.use(cookieParser());


// Middleware to parse data in JSON and URL-encoded data in requests i.e to pass data in json format from the frontend to the backend
app.use(express.json());


// Middleware to parse URL-encoded data in requests, which is typically used for form submissions
app.use(express.urlencoded({ extended: true }));


// Middleware to handle file uploads, allowing temporary storage of files in the specified directory
// This is used to handle file uploads from the frontend to the backend
// alternatively, we can use multer for file uploads, but here we are using express-fileupload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auctionitem", auctionItemRouter);
app.use("/api/v1/bid", bidRouter);
app.use("/api/v1/commission", commissionRouter);
app.use("/api/v1/superadmin", superAdminRouter);
app.get("/api/auctions", (req, res) => {
  res.json({ message: "Backend is working!" });
});

BidderWon();
PaymentSettled();

// Establish a connection to the database using the connection function imported from the connection module
connection();


// Error handling middleware to catch and handle errors in the application
app.use(errorMiddleware);



export default app;
