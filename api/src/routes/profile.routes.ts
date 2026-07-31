import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createProfile,
  getMyProfile,
  updateMyProfile,
  getProfileByUsername,
} from "../controllers/profile.controller.js";

const router = Router();

// Public
router.get("/u/:username", getProfileByUsername);

// Protect everything below
router.use(protect);

router.post("/", createProfile);
router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);

export default router;
