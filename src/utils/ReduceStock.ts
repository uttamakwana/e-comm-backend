import { ProductModel } from '../models/Product.js';
import { OrderItemType } from '../types/Order.js'

//* this function will reduce the stock of specific product which has orderd */
export const reduceStock = async (orderItem: OrderItemType[]) => {
 for (let index = 0; index < orderItem.length; index++) {
  // we are looping through each order product! and will reduce the stock in that individual
  const order = orderItem[index];
  const product = await ProductModel.findById(order.productId);
  if(!product) throw new Error("Product not found!");
  product.stock -= order.quantity;
  // after reducing the stock we will save the product
  await product.save();
 }
}
