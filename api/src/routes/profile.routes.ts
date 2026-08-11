import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  checkUsernameAvailability,
  createProfile,
  getMyProfile,
  updateMyProfile,
  getProfileByUsername,
} from "../controllers/profile.controller.js";
import { uploadMyAvatar, uploadMyCover } from "../controllers/upload.controller.js";
import { avatarUpload, coverUpload } from "../middleware/upload.js";
import { resizeAvatar, resizeCover } from "../middleware/resizeImage.js";

const router = Router();

router.get("/u/:username", getProfileByUsername);

router.use(protect);

router.get("/username-available", checkUsernameAvailability);
router.post("/", createProfile);
router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.post(
  "/me/avatar",
  avatarUpload.single("avatar"),
  resizeAvatar,
  uploadMyAvatar,
);
router.post(
  "/me/cover",
  coverUpload.single("cover"),
  resizeCover,
  uploadMyCover,
);

export default router;

