import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createCollection,
  deleteCollection,
  getMyCollections,
  getPublicCollectionsByUsername,
  updateCollection,
} from "../controllers/collection.controller.js";

const router = Router();

// Public shop groupings for published profiles
router.get("/u/:username", getPublicCollectionsByUsername);

// Owner-only below
router.use(protect);

router.get("/me", getMyCollections);
router.post("/", createCollection);
router.patch("/:id", updateCollection);
router.delete("/:id", deleteCollection);

export default router;
