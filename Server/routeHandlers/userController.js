import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  // Check if files are provided in the request
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Profile Image Required.", 400));
  }

  const { profileImage } = req.files; 


  //
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(profileImage.mimetype)) {//.mimetype is used to check the file type
    return next(new ErrorHandler("File format not supported.", 400));
  }

  const {
    userName,
    email,
    password,
    phone,
    address,
    role,
    bankAccountNumber,
    bankAccountName,
    bankName,
    upi_id,
    paypalEmail,
  } = req.body;

  if (!userName || !email || !phone || !password || !address || !role) {
    return next(new ErrorHandler("Please fill full form.", 400));
  }

  if (role === "Auctioneer") {
    if (!bankAccountName || !bankAccountNumber || !bankName) {
      return next(
        new ErrorHandler("Please provide your full bank details.", 400)
      );
    }

    
    if (!upi_id) {
      return next(
        new ErrorHandler("Please provide your UPI number.", 400)
      );
    }

    if (!paypalEmail) {
      return next(new ErrorHandler("Please provide your paypal email.", 400));
    }
  }

  

  const isRegistered = await User.findOne({ email });
  
  if (isRegistered) {
    return next(new ErrorHandler("User already registered.", 400));
  }

  // Upload profile image to Cloudinary
  const cloudinaryResponse = await cloudinary.uploader.upload(
    profileImage.tempFilePath,
    {
      folder:"MERN_AUCTION_PLATFORM_USERS",
    }
  );

  

  // Check if the upload was successful
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary error:",
      cloudinaryResponse.error || "Unknown cloudinary error."
    );
    return next(
      new ErrorHandler("Failed to upload profile image to cloudinary.", 500)
    );
  }

  // Create user in the database
  const user = await User.create({
    userName,
    email,
    password,
    phone,
    address,
    role,
    profileImage: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    paymentMethods: {
      bankTransfer: {
        bankAccountNumber,
        bankAccountName,
        bankName,
      },
      upi_id: {
        upi_number,
      },
      paypal: {
        paypalEmail,
      },
    },
  });


// generate JWT token for the user
  generateToken(user, "User Registered.", 201, res);
});



export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
    return next(new ErrorHandler("Please fill full form."));
  }
  const user = await User.findOne({ email }).select("+password");// select "+password" is used to include the password field in the query result, as it is not included by default for security reasons.

  if (!user) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }
  generateToken(user, "Login successfully.", 200, res);
});

export const getProfile = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});



export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", { // Clear the token cookie
      // Set the cookie to expire immediately
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logout Successfully.",
    });
});

export const fetchLeaderboard = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ moneySpent: { $gt: 0 } });// Fetch users who have spent money greater than 0
  const leaderboard = users.sort((a, b) => b.moneySpent - a.moneySpent);//
  res.status(200).json({
    success: true,
    leaderboard,
  });
});
