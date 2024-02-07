import mongoose from 'mongoose'

// order items(products) props
export type OrderItemType = {
 name: string,
 photo: string,
 price: number,
 quantity: number,
 productId: mongoose.Types.ObjectId,
};

// shipping info props
export type ShippingInfoType = {
 address: string,
 city: string,
 state: string,
 country: string,
 pincode: number
};

// when user creates order
export type OrderType = {
 shippingInfo: ShippingInfoType,
 user: mongoose.Types.ObjectId,
 discount: number,
 tax: number,
 shippingCharge: number,
 subTotal: number,
 total: number,
 status: string,
 orderItems: OrderItemType
}
