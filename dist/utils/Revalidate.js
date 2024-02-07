import { myCache } from '../app.js';
import { adminStatsCacheKeys } from '../controllers/Stats.js';
//* whenver new product is added, updated, delete or whenever user purchased product, remove from cart, add into cart then we have to revalidate(remove) the cache memory that has stored in our PC */
export const invalidateCache = ({ product, order, admin, userId, orderId, productId }) => {
    if (product) {
        const productCacheKeys = ["latest-product", "categories", "all-products"];
        if (typeof productId === "string")
            productCacheKeys.push(`product-${productId}`);
        if (typeof productId === "object")
            productId.forEach(productId => productCacheKeys.push(`product-${productId}`));
        //? the above one is better than below one
        // to delete the cache key of specific product we have extract the keys of individual products
        // const productIDs = (await ProductModel.find({}).select("_id"));
        // we are pushing every product Ids into the productCacheKeys
        // productIDs.forEach((product) => productCacheKeys.push(`product-${product._id}`))
        // deleting every cache keys so that whenever product is added, updated, deleted, and order is purchased the latest-product, all-categories, all-products, and a specific product gets deleted from the cache memory!
        myCache.del(productCacheKeys);
    }
    if (order) {
        const orderCacheKeys = ["all-orders", `my-orders-${userId}`, `order-${orderId}`];
        // to delete the cache key of specific product we have extract the keys of individual products
        // const orderIDs = (await OrderModel.find({}).select("_id"));
        // we are pushing every product Ids into the productCacheKeys
        // orderIDs.forEach((order) => orderCacheKeys.push(`order-${order._id}`))
        // deleting every cache keys so that whenever product is added, updated, deleted, and order is purchased the latest-product, all-categories, all-products, and a specific product gets deleted from the cache memory!
        myCache.del(orderCacheKeys);
    }
    if (admin) {
        myCache.del(adminStatsCacheKeys);
    }
};
