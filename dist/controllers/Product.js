import { TryCatch } from '../middlewares/Error.js';
import ErrorHandler from '../utils/Error.js';
import { ProductModel } from '../models/Product.js';
import { rm } from 'fs';
import { ObjectId } from 'mongodb';
import { faker } from "@faker-js/faker";
import { myCache } from '../app.js';
import { invalidateCache } from '../utils/Revalidate.js';
// get latest product
// route: products/latest
// GET
// Public
//! must revalidate after products are added, updated, deleted or someone makes an order (because everytime this happens latest-products will be different but it will give us the same latest products everytime)
export const getLatestProduct = TryCatch(async (req, res, next) => {
    let products;
    // we are checking in the cache memory that if latest-products exists or not!
    if (myCache.has("latest-products")) {
        // we are storing latest products in the products array
        products = JSON.parse(myCache.get("latest-products"));
    }
    else {
        // we are getting the latest product on the based of when they were created/added into the database and sending only 5 of them.
        products = await ProductModel.find({}).sort({ createdAt: -1 }).limit(5);
        // we are storing this latest product in cache memory (RAM Memory) before we give back the response
        myCache.set("latest-products", JSON.stringify(products));
    }
    // giving back latest products!
    return res.status(200).json({ success: true, message: "Products retrieved successfully!", products });
});
// get all distinct categories
// route: products/categories
// GET
// Public
export const getCategories = TryCatch(async (req, res, next) => {
    let categories;
    // check if categories exists in cache memory or not!
    if (myCache.has("categories")) {
        categories = JSON.parse(myCache.get("categories"));
    }
    else {
        // find only distinct categories in the products
        categories = await ProductModel.distinct("category");
        // we are setting categories in cache memory
        myCache.set("categories", JSON.stringify(categories));
    }
    // giving back categories
    return res.status(200).json({ success: true, message: "Categories retrieved successfully", categories });
});
// get all products
// router: products/all
// GET
// Private
export const getAllProducts = TryCatch(async (req, res, next) => {
    let products;
    // checking if all-products exists in cache memory or not!
    if (myCache.has("all-products")) {
        // giving back cache products for fast response
        products = JSON.parse(myCache.get("all-products"));
    }
    else {
        // finding all the existing products
        products = await ProductModel.find({});
        myCache.set("all-products", JSON.stringify(products));
    }
    // giving back products
    return res.status(200).json({ success: true, message: "Products retrived successfully!", products });
});
// get a specific product
// route: products/:id
// GET
export const getProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    // if id is valid mongoDB id or not
    if (!ObjectId.isValid(id))
        return next(new ErrorHandler("Provide a valid mongoDB id!", 400));
    let product;
    // checking if product exists in cache memory or not!
    if (myCache.has(`product-${id}`)) {
        product = JSON.parse(myCache.get(`product-${id}`));
    }
    else {
        // find a product
        product = await ProductModel.findById(id);
        // if product not found!
        if (!product)
            return next(new ErrorHandler("Product not found", 404));
        // storing in the cache memory
        myCache.set(`product-${id}`, JSON.stringify(product));
    }
    // give back the product
    return res.status(200).json({ success: true, message: `Product ${product.name} retrieved successfully`, product });
});
// get all products with filter
// routes: products/
// GET
export const getProducts = TryCatch(async (req, res, next) => {
    //* we are extracting request query params
    const { search, sort, category, price } = req.query;
    //* we are defining the pages
    const page = Number(req.query.page) || 1;
    //* setting limits of products shown in the page
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 5;
    //* this amount of products will be skiped every time this endpoing got called
    //* if page=2 then skip = 3 ( 2 - 1) = 3;
    //*  so it means we will skip first 3 products as we have shown them on the first page so we will skip 3 and will show another 3 products after the first 3 products.
    const skip = limit * (page - 1);
    //* find products and filter according the query params
    const filterOptions = {};
    // * if we get only search query params
    if (search) {
        filterOptions.name = {
            $regex: search,
            $options: "i",
        };
    }
    //* if we get only price query params
    if (price) {
        filterOptions.price = {
            $lte: Number(price)
        };
    }
    //* if we get only category price
    if (category) {
        filterOptions.category = category;
    }
    //* find the product according to filterOptions
    //* sort the products from the low to high price if sort is applied
    // const products = await ProductModel.find(filterOptions).sort(sort && { price: sort === "ascending" ? 1 : -1 }).limit(limit).skip(skip);
    //* this products are only filterd with search, category, and price
    //! skip, limit, and sort is not applied here!
    // const filteredOnlyProducts = await ProductModel.find(filterOptions);
    // Solution: We are comibing the above two promise into one by Promise.all
    const productsPromise = ProductModel.find(filterOptions).sort(sort && { price: sort === "ascending" ? 1 : -1 }).limit(limit).skip(skip);
    const filterdProductPromise = ProductModel.find(filterOptions);
    const [products, filteredOnlyProducts] = await Promise.all([productsPromise, filterdProductPromise]);
    // after filtering out products we can find out the total page of products!
    const totalPage = Math.ceil(filteredOnlyProducts.length / limit);
    return res.status(200).json({ success: true, message: "Products retrieved successfully!", products, totalPage });
});
// generate fake products
//! only for development purpose
const generateRandomFakeProducts = async (count = 10) => {
    const products = [];
    for (let i = 0; i < count; i++) {
        const product = {
            name: faker.commerce.productName(),
            photo: "uploads\\1.jpg",
            price: faker.commerce.price({ min: 100, max: 100000, dec: 0 }),
            stock: faker.commerce.price({ min: 0, max: 1000, dec: 0 }),
            category: faker.commerce.department().toLowerCase(),
            createdAt: new Date(faker.date.past()),
            updatedAt: new Date(faker.date.recent()),
            __V: 0,
        };
        products.push(product);
    }
    await ProductModel.create(products);
    console.log({ success: false });
};
generateRandomFakeProducts(50);
// create a new product
// route: products/create
// POST
// Private - Only admin can do this
export const createProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    // we are taking photo from the multer middleware named 'singleUpload'
    const photo = req.file;
    // if any of one has not inputed
    if (!photo)
        return next(new ErrorHandler("Please add product image!", 400));
    if (!name || !price || !stock || !category) {
        // we are removing the product image as it uploaded to the 'upload' folder before coming to this handler in 'singleUpload' middleware
        rm(photo.path, () => {
            console.log("Photo deleted successfully!");
        });
        // give an error that all fileds are required!
        return next(new ErrorHandler("All details are necessary!", 400));
    }
    // create a new product
    const product = await ProductModel.create({ name, photo: photo?.path, price, stock, category: category.toLowerCase() });
    // we are invalidating the existing cache memory
    invalidateCache({ product: true, admin: true, productId: String(product._id) });
    // return the response
    return res.status(201).json({ success: true, message: `Product named ${product.name} created successfully`, product });
});
// update a specific product
// router: products/:id
// PUT
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    // check if id is valid mongoDB id or not
    if (!ObjectId.isValid(id))
        return next(new ErrorHandler("Provide a valid mongoDB id!", 400));
    // finding the specific product
    const product = await ProductModel.findById(id);
    // if product not found
    if (!product)
        return next(new ErrorHandler("Product not found!", 404));
    // if photo is added!
    if (photo) {
        // removing the old photo and adding the new one!
        rm(product.photo, () => {
            console.log("Removing the old photo!");
        });
        product.photo = photo.path;
    }
    // if any of name, price, stock, category is in req.body
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    await product.save();
    // we are invalidating the existing cache memory
    invalidateCache({ product: true, admin: true, productId: String(product._id) });
    // giving back the updated product
    return res.status(200).json({ success: true, message: `Product ${product.name} updated successfully!`, product });
});
// delete a specific product
// route: products/:id
// DELETE
export const deleteProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    // check id is valid mongoDB id or not
    if (!ObjectId.isValid(id))
        return next(new ErrorHandler("Please provide a valid mongodb ID", 400));
    // find a product
    const product = await ProductModel.findById(id);
    // check product exists or not
    if (!product)
        return next(new ErrorHandler("Product not found!", 404));
    // delete the product and its photo
    rm(product.photo, () => {
        console.log("Product photo deleted successfully!");
    });
    await product.deleteOne();
    // we are invalidating the existing cache memory
    invalidateCache({ product: true, admin: true, productId: String(product._id) });
    // give back the deleted product
    return res.status(200).json({ success: true, message: `Product ${product.name} deleted successfully!`, product });
});
