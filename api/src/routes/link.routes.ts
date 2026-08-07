import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createLink,
  getMyLinks,
  updateLink,
  deleteLink,
  reorderLinks,
  getPublicLinksByUsername,
  redirectPublicLink,
} from "../controllers/link.controller.js";

const router = Router();

router.get("/u/:username", getPublicLinksByUsername);
router.get("/r/:id", redirectPublicLink);

router.use(protect);

router.post("/", createLink);
router.get("/me", getMyLinks);

// IMPORTANT: register /reorder BEFORE /:id
// Otherwise Express treats "reorder" as an :id value
router.patch("/reorder", reorderLinks);

router.patch("/:id", updateLink);
router.delete("/:id", deleteLink);

export default router;
