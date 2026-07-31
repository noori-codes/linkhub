import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createLink,
  getMyLinks,
  updateLink,
  deleteLink,
  reorderLinks,
  getPublicLinksByUsername,
} from "../controllers/link.controller.js";

const router = Router();

// Public first — no JWT required
// Only returns visible links for a published profile
router.get("/u/:username", getPublicLinksByUsername);

// Everything below this line requires a valid JWT (protect sets req.user)
router.use(protect);

router.post("/", createLink);
router.get("/me", getMyLinks);

// IMPORTANT: register /reorder BEFORE /:id
// Otherwise Express treats "reorder" as an :id value
router.patch("/reorder", reorderLinks);

router.patch("/:id", updateLink);
router.delete("/:id", deleteLink);

export default router;
