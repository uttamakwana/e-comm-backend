import { ObjectId } from 'mongodb';
import ErrorHandler from '../utils/Error.js';
import { TryCatch } from './Error.js';
import { UserModel } from '../models/User.js';

//* Creating a middleware of authentication
export const adminAuth = TryCatch(async (req, res, next) => {
 const { id } = req.query;
 console.log(id);
 // Check if id exists and is a string
 if (!id || typeof id !== 'string') {
  return next(new ErrorHandler("Unauthorized access! Login first!", 403));
 }
 // if the provided id is not valid mongodb id
 if (!ObjectId.isValid(id)) return next(new ErrorHandler("Unauthorized Access!", 403));

 // find an admin
 const userAsAdmin = await UserModel.findById(id);
 // return error if not found!
 if (!userAsAdmin) return next(new ErrorHandler("Unauthorized Access!", 403));

 // check if it has an admin role or not
 // return error if not admin
 if (userAsAdmin.role !== "admin") return next(new ErrorHandler("Unauthorized Access!", 403));

 // we are flaging that you can access the endpoint with next();
 next();
})
