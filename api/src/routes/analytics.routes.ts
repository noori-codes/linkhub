import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import { getMyAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

// Owner-only — never public
router.use(protect);

router.get("/me", getMyAnalytics);

export default router;
