import mongoose from 'mongoose';
import validator from 'validator';
import { UserType } from '../types/User.js';

//* creating a schema
const UserSchema = new mongoose.Schema({
 u_id: {
  type: String,
  required: [true, "Please enter your ID!"]
 },
 name: {
  type: String,
  required: [true, "Please enter your name!"]
 },
 email: {
  type: String,
  unique: [true, "Email already exists!"],
  required: [true, "Please enter your email!"],
  validate: validator.default.isEmail
 },
 photo: {
  type: String,
  required: [true, "Please add your photo!"]
 },
 role: {
  type: String,
  enum: ["admin", "user"],
  default: "user",
 },
 gender: {
  type: String,
  enum: ["male", "female"],
  required: [true, "Please enter your gender!"]
 },
 dob: {
  type: Date,
  required: [true, "Please enter your date of birth!"]
 }
}, { timestamps: true });

//* calculating age for stats
UserSchema.virtual("age").get(function () {
 const today = new Date();
 const dob = this.dob;
 let age = today.getFullYear() - dob.getFullYear();

 if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
  return age--;
 } return age;
})

//* exporting user model
export const UserModel = mongoose.model<UserType>("users", UserSchema);
