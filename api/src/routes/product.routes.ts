import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createProduct,
  getAllProducts,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  createProductLink,
  getProductLinks,
  updateProductLink,
  deleteProductLink,
} from "../controllers/productLink.controller.js";

const router = Router();

// Owner-only for now (public shop listing comes later)
router.use(protect);

router.get("/", getAllProducts);
router.post("/", createProduct);
router.get("/me", getMyProducts);

// Nested buy/affiliate links — register before bare /:id
router.get("/:productId/links", getProductLinks);
router.post("/:productId/links", createProductLink);
router.patch("/:productId/links/:linkId", updateProductLink);
router.delete("/:productId/links/:linkId", deleteProductLink);

router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
