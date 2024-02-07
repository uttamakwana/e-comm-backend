import mongoose from 'mongoose';

//* creating a product schema
const ProductSchema = new mongoose.Schema({
 name: {
  type: String,
  required: [true, "Please enter a product name!"]
 }, photo: {
  type: String,
  required: [true, "Please add a product photo!"]
 }, price: {
  type: Number,
  required: [true, "Please enter a product price!"]
 }, stock: {
  type: Number,
  required: [true, "Please enter a product stock!"]
 }, category: {
  type: String,
  required: [true, "Please enter a product category!"],
  trim: true
 },
}, { timestamps: true });

//* exporting a product model
export const ProductModel = mongoose.model("products", ProductSchema);
