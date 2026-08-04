import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createProduct,
  getAllProducts,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = Router();

// Owner-only for now (public shop listing comes later)
router.use(protect);

router.get("/", getAllProducts);
router.post("/", createProduct);
router.get("/me", getMyProducts);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
