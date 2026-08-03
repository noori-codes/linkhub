import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createProfile,
  getMyProfile,
  updateMyProfile,
  getProfileByUsername,
} from "../controllers/profile.controller.js";
import { uploadMyAvatar } from "../controllers/upload.controller.js";
import { avatarUpload } from "../middleware/upload.js";

const router = Router();

// Public — only published profiles
router.get("/u/:username", getProfileByUsername);

// Everything below requires login (JWT → req.user)
router.use(protect);

router.post("/", createProfile);
router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.post("/me/avatar", avatarUpload.single("avatar"), uploadMyAvatar);

export default router;

