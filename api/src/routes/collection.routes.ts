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

router.get("/u/:username", getPublicCollectionsByUsername);

router.use(protect);

router.get("/me", getMyCollections);
router.post("/", createCollection);
router.patch("/:id", updateCollection);
router.delete("/:id", deleteCollection);

export default router;
