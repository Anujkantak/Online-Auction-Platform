import express from "express";
import {
  fetchLeaderboard,
  getProfile,
  login,
  logout,
  register,
} from "../routeHandlers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// using isAuthenticated middleware to get the particular user we want to proceed with like get profile or logout beacuse at this time we dont have any field to identify the user like userId or email so we are using token to identify the user

router.get("/me", isAuthenticated, getProfile);
router.get("/logout", isAuthenticated, logout);
router.get("/leaderboard", fetchLeaderboard);

export default router;
