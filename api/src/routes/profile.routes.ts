import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createProfile,
  getMyProfile,
  updateMyProfile,
  getProfileByUsername,
} from "../controllers/profile.controller.js";

const router = Router();

// Public — only published profiles
router.get("/u/:username", getProfileByUsername);

// Everything below requires login (JWT → req.user)
router.use(protect);

router.post("/", createProfile);
router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);

export default router;
