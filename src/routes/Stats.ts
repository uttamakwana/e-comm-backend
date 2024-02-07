import express from "express";
import { adminAuth } from '../middlewares/Auth.js';
import { getBarStats, getDashboardStats, getLineStats, getPieStats } from '../controllers/Stats.js';

const router = express.Router();

//* handling route
// dashbaord stats
router.get("/dashboard", adminAuth, getDashboardStats);
// pie
router.get("/pie", adminAuth, getPieStats);
// bar
router.get("/bar", adminAuth, getBarStats);
// line
router.get("/line", adminAuth, getLineStats);

//* exporting router
export default router;
