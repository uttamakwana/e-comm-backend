// when admin is creating a product this props are necessary
export type ProductType = {
 name: string,
 photo: string,
 price: number,
 stock: number,
 category: string
}

// when user is search for a product with search bar and puts query
export type SearchProductQuery = {
 search?: string,
 price?: string,
 category?: string,
 sort?: string,
 page?: string
}

// when user search then this filters will be applied
export type FilterOptionsType = {
 name?: {
  $regex: string,
  $options: string
 },
 price?: {
  $lte: number
 },
 category?: string,
}
