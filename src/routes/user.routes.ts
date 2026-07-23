import { Router } from "express";

import {
  signup,
  login,
  logout,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/auth.controller.js";

import { getMe, getUser } from "../controllers/user.controller.js";

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// Protect everything below
router.use(protect);

// Protected routes
router.patch("/updateMyPassword", updatePassword);

router.get("/me", getMe, getUser);

export default router;
