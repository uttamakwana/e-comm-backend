import { UserModel } from '../models/User.js';
import ErrorHandler from '../utils/Error.js';
import { TryCatch } from '../middlewares/Error.js';
import { ObjectId } from 'mongodb';
//* register a new user
// router: users/register
// POST
//! Public
export const userRegister = TryCatch(async (req, res, next) => {
    const { u_id, name, email, photo, gender, dob } = req.body;
    // user input all the information or not
    if (!u_id || !name || !email || !photo || !gender || !dob)
        return next(new ErrorHandler("Please input all the required fields!", 400));
    // user exits or not
    let user = await UserModel.findOne({ email });
    if (user)
        return next(new ErrorHandler("Email already exists!", 400));
    // creating an user
    user = await UserModel.create({ u_id, name, email, photo, gender, dob: new Date(dob) });
    // giving response to the user
    return res.status(200).json({ success: true, message: `Welcome ${user.name}`, user });
});
//* get all Users
// router: users/all
// GET
//! Private
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await UserModel.find({});
    return res.status(200).json({ success: true, message: "Users retrieved successfully", users });
});
//* get only one user
// router: users/:id
// GET
//! Public
export const getUser = TryCatch(async (req, res, next) => {
    const { email } = req.params;
    // if the provided id is not valid mongodb id
    // if (!ObjectId.isValid(id)) return next(new ErrorHandler("Please provide a valid MongoDB User Id", 400));
    // find user
    // const user = await UserModel.findById(id);
    const user = await UserModel.findOne({ email });
    // return an error if user not found
    if (!user)
        return next(new ErrorHandler("User not found!", 404));
    // otherwise send response with a particular user
    return res.status(200).json({ success: true, message: `User ${user.name} retrieved successfully!`, user });
});
//* to delete a specific user
// route: users/:id
// DELETE
//! Private
export const deleteUser = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    // if the provided id is not valid mongodb id
    if (!ObjectId.isValid(id))
        return next(new ErrorHandler("Please provide a valid MongoDB User Id", 400));
    // find user
    let user = await UserModel.findById(id);
    // return an error if user not found
    if (!user)
        return next(new ErrorHandler("User not found!", 404));
    // now delete a user
    await user.deleteOne();
    // return the response
    return res.status(200).json({ success: true, message: `User ${user.name} deleted successfully!`, user });
});
