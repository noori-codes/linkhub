import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  getMyAnalytics,
  recordProfileShare,
  recordProfileView,
} from "../controllers/analytics.controller.js";

const router = Router();

// Public — visitors on /u/:username
router.post("/u/:username/view", recordProfileView);
router.post("/u/:username/share", recordProfileShare);

// Owner-only below
router.use(protect);

router.get("/me", getMyAnalytics);

export default router;
