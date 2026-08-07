import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createCollection,
  deleteCollection,
  getMyCollections,
  updateCollection,
} from "../controllers/collection.controller.js";

const router = Router();

router.use(protect);

router.get("/me", getMyCollections);
router.post("/", createCollection);
router.patch("/:id", updateCollection);
router.delete("/:id", deleteCollection);

export default router;
