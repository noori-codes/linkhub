import { Router } from "express";

import { protect } from "../controllers/auth.controller.js";
import {
  createProduct,
  getAllProducts,
  getMyProducts,
  getPublicProductsByUsername,
  previewProductLink,
  uploadProductImage,
  uploadProductImageFromUrl,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { productUpload } from "../middleware/upload.js";
import {
  createProductLink,
  getProductLinks,
  updateProductLink,
  deleteProductLink,
} from "../controllers/productLink.controller.js";

const router = Router();

router.get("/u/:username", getPublicProductsByUsername);

router.use(protect);

router.get("/", getAllProducts);
router.post("/", createProduct);
router.get("/me", getMyProducts);
router.post("/link-preview", previewProductLink);

// Nested buy/affiliate links — register before bare /:id
router.get("/:productId/links", getProductLinks);
router.post("/:productId/links", createProductLink);
router.patch("/:productId/links/:linkId", updateProductLink);
router.delete("/:productId/links/:linkId", deleteProductLink);

router.post("/:id/image", productUpload.single("image"), uploadProductImage);
router.post("/:id/image-from-url", uploadProductImageFromUrl);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
