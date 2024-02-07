import { ProductModel } from '../models/Product.js';
//* this function calculates percentage of products in each category */
export const countCategory = async ({ categories, productsCount }) => {
    // finding number of products with each category
    const categoriesCountPromise = categories.map((category) => ProductModel.countDocuments({ category }));
    // now we have counts of products with each category
    const categoriesCounts = await Promise.all(categoriesCountPromise);
    // category count state
    // let categoryCount = new Array();
    let categoryCount = [];
    // basically we are diving each category products counts with total products count to get the percentage of each category products and with toFixed(0) we are converting 4.5900323423 to 4
    // categories.forEach((category, index) => categoryCount.push({ [category]: Number(((categoriesCounts[index] / productsCount) * 100).toFixed(0) ) }))
    categories.forEach((category, index) => categoryCount.push({ [category]: Math.round((categoriesCounts[index] / productsCount) * 100) }));
    return categoryCount;
};
