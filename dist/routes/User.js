import express from "express";
import { adminAuth } from '../middlewares/Auth.js';
import { deleteUser, getAllUsers, getUser, userRegister } from '../controllers/User.js';
const router = express.Router();
//* handling routes
// create new user router
router.post("/register", userRegister);
// get all users
router.get("/all", adminAuth, getAllUsers);
// get a specific user
router.get("/:email", getUser);
// delete a specific user
router.delete("/:id", deleteUser);
//* exporting router
export default router;
