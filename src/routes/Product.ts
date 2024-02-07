import express from "express";
import { createProduct, deleteProduct, getAllProducts, getCategories, getLatestProduct, getProduct, getProducts, updateProduct } from '../controllers/Product.js';
import { adminAuth } from '../middlewares/Auth.js';
import { singleUpload } from '../middlewares/Multer.js';

const router = express.Router();

//* handling routes
// get filtered products / searched products / sorted products
router.get("/", getProducts);
// create a new product | Admin
router.post('/create', adminAuth, singleUpload, createProduct);
// get all products | Admin
router.get("/all", adminAuth, getAllProducts)
// get latest products
router.get('/latest', getLatestProduct);
// get all categories
router.get('/categories', getCategories);
// get a specific product
router.get("/:id", getProduct);
// update a product | Admin
router.put("/:id", adminAuth, updateProduct)
// delete a product | Admin
router.delete("/:id", adminAuth, deleteProduct);

//* exporting router
export default router;
