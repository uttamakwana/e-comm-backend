import { myCache } from '../app.js';
import { TryCatch } from '../middlewares/Error.js';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { UserModel } from '../models/User.js';
import { calculatePercentage } from '../utils/CalculateStats.js';
import { countCategory } from '../utils/Category.js';
import { previousMonthStats } from '../utils/PreviousMonth.js';
export const adminStatsCacheKeys = ["admin-stats", "admin-pie-charts", "admin-bar-charts", "admin-line-charts"];

//* to get all stats of admin dashboard
// route: stats/dashboard
// GET
//! Private
export const getDashboardStats = TryCatch(async (req, res, next) => {
 let stats;
 const key = "admin-stats";
 if (myCache.has(key)) {
  stats = JSON.parse(myCache.get(key) as string);
 } else {
  const today = new Date();
  // represent six month span
  const sixMonthAgo = new Date();
  sixMonthAgo.setDate(sixMonthAgo.getMonth() - 6);
  // represent the current month
  const thisMonth = {
   // first date of the month
   start: new Date(today.getFullYear(), today.getMonth(), 1),
   // as we are going to calculate the product since now
   end: today
  }
  // represent the last month
  const lastMonth = {
   // first date of last month
   start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
   // last date of last month
   end: new Date(today.getFullYear(), today.getMonth() - 1, 0)
  }

  // finding current(this) month products
  const thisMonthProductsPromise = ProductModel.find({
   createdAt: {
    $gte: thisMonth.start,
    $lte: thisMonth.end
   }
  })
  // finding last month products
  const lastMonthProductsPromise = ProductModel.find({
   createdAt: {
    $gte: lastMonth.start,
    $lte: lastMonth.end
   }
  })

  // finding current(this) month users
  const thisMonthUsersPromise = UserModel.find({
   createdAt: {
    $gte: thisMonth.start,
    $lte: thisMonth.end
   }
  })
  // finding last month users
  const lastMonthUsersPromise = UserModel.find({
   createdAt: {
    $gte: lastMonth.start,
    $lte: lastMonth.end
   }
  })

  // finding current(this) month orders
  const thisMonthOrdersPromise = OrderModel.find({
   createdAt: {
    $gte: thisMonth.start,
    $lte: thisMonth.end
   }
  })
  // finding last month orders
  const lastMonthOrdersPromise = OrderModel.find({
   createdAt: {
    $gte: lastMonth.start,
    $lte: lastMonth.end
   }
  })

  // calculating last six months revenue
  const lastSixMonthOrdersPromise = OrderModel.find({
   createdAt: {
    $gte: sixMonthAgo,
    $lte: today
   }
  })

  // latest transaction promise
  const latestTransactionPromsie = OrderModel.find({}).limit(5).select(["orderItems", "discount", "total", "status"]);

  // executing all the promises
  const [thisMonthProducts, lastMonthProducts, thisMonthUsers, lastMonthUsers, thisMonthOrders, lastMonthOrders, productsCount, usersCount, allOrders, lastSixMonthOrders, categories, maleUserCounts, femaleUserCounts, latestTransactions] = await Promise.all([thisMonthProductsPromise, lastMonthProductsPromise, thisMonthUsersPromise, lastMonthUsersPromise, thisMonthOrdersPromise, lastMonthOrdersPromise, ProductModel.countDocuments(), UserModel.countDocuments(), OrderModel.find({}).select("total"), lastSixMonthOrdersPromise, ProductModel.distinct("category"), UserModel.countDocuments({ gender: "male" }), UserModel.countDocuments({ gender: "female" }), latestTransactionPromsie]);

  // calculating percentage change in products, users and orders
  const productsChangePR = calculatePercentage(thisMonthProducts.length, lastMonthProducts.length);
  const usersChangePR = calculatePercentage(thisMonthUsers.length, lastMonthUsers.length);
  const ordersChangePR = calculatePercentage(thisMonthOrders.length, lastMonthOrders.length);

  // calculating revenue
  const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + order?.total || 0, 0)
  const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + order?.total || 0, 0)
  const revenueChangePR = calculatePercentage(thisMonthRevenue, lastMonthRevenue);

  // calculating revenue
  const revenue = allOrders.reduce((total, order) => total + (order?.total || 0), 0);

  // calculating last 6 months revenue by each month
  const monthOrdersCount = new Array(6).fill(0);
  const monthOrdersRevenue = new Array(6).fill(0);
  lastSixMonthOrders.forEach(order => {
   const creationDate = order.createdAt;
   // we are adding 12 if we get diff minus and modulo 12 if get more then 12
   const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
   if (monthDiff < 6) {
    monthOrdersCount[6 - monthDiff - 1] += 1;
    monthOrdersRevenue[6 - monthDiff - 1] += order.total;
   }
  })

  // counting products with each categories
  const categoryCount = await countCategory({ categories, productsCount });
  // creating counts for everything
  const count = {
   revenue,
   products: productsCount,
   users: usersCount,
   orders: allOrders.length,
   categoryCount
  }

  // as we don't need to show all the orderItems so we are just sending the length of it.
  const modifiedLatestTransactions = latestTransactions.map((transaction) => ({
   _id: transaction._id,
   discount: transaction.discount,
   amount: transaction.total,
   quantity: transaction.orderItems.length,
   status: transaction.status
  }))

  // final stats
  stats = {
   latestTransactions: modifiedLatestTransactions, ratio: { male: maleUserCounts, female: femaleUserCounts }, count, lastSixMonthChart: { order: monthOrdersCount, revenue: monthOrdersRevenue }, revenueChangePR, productsChangePR, usersChangePR, ordersChangePR
  };

  myCache.set(key, JSON.stringify(stats));
 }

 return res.status(200).json({ success: true, message: "Stats calculated successfully!", stats });
});

// to get admin pie chart stats
// route: stats/pie
// GET
// Private
export const getPieStats = TryCatch(async (req, res, next) => {
 let pieCharts;
 const key = "admin-pie-charts";
 if (myCache.has(key)) {
  pieCharts = JSON.parse(myCache.get(key) as string);
 } else {
  const allOrdersWithAmountsPromise = OrderModel.find({}).select(["total", "discount", "subTotal", "tax", "shippingCharge"]);
  // executing all promises here
  const [processingProductsCount, shippedProductsCount, deliveredProductCounts, categories, productsCount, productsOutOfStock, allOrdersWithAmounts, usersWithDOB, usersWithRoleUser, usersWithRoleAdmin] = await Promise.all([OrderModel.countDocuments({ status: "Processing" }), OrderModel.countDocuments({ status: "Shipped" }), OrderModel.countDocuments({ status: "Delivered" }), ProductModel.distinct("category"), ProductModel.countDocuments(), ProductModel.countDocuments({ stock: 0 }), allOrdersWithAmountsPromise, UserModel.find({}).select("dob"), UserModel.countDocuments({ role: "user" }), UserModel.countDocuments({ role: "admin" })])

  // counting status of products
  const statusCount = { processing: processingProductsCount, shipped: shippedProductsCount, delivered: deliveredProductCounts }

  // counting categories/inventories
  const categoryCount = await countCategory({ categories, productsCount })

  // stock availibility
  const stockAvailability = {
   inStock: productsCount - productsOutOfStock,
   outOfStock: productsOutOfStock
  }

  // gross income
  const grossIncome = allOrdersWithAmounts.reduce((total, order) => total + (order.total || 0), 0)
  // total discount
  const totalDiscount = allOrdersWithAmounts.reduce((total, order) => total + (order.discount || 0), 0)
  // production cost
  const productionCost = allOrdersWithAmounts.reduce((total, order) => total + (order.shippingCharge || 0), 0)
  // total burnt (barbad money)
  const totalBurnt = allOrdersWithAmounts.reduce((total, order) => total + (order.tax || 0), 0);
  // total marketing cost
  const marketingCost = Math.round(grossIncome * (30 / 100));
  // net margin
  const netMargin = grossIncome - totalDiscount - productionCost - totalBurnt - marketingCost;
  // revenue distribution
  const revenueDistribution = {
   netMargin,
   discount: totalDiscount,
   productionCost,
   burnt: totalBurnt,
   marketingCost
  }

  const usersAgeGroup = {
   teen: usersWithDOB.filter(user => user.age < 20).length,
   adult: usersWithDOB.filter(user => user.age >= 20 && user.age < 40).length,
   old: usersWithDOB.filter(user => user.age >= 40).length
  }

  const usersCount = {
   admin: usersWithRoleAdmin,
   customers: usersWithRoleUser
  }

  // adding all into pieCharts
  pieCharts = { usersAgeGroup, usersCount, revenueDistribution, allOrdersWithAmounts, statusCount, categoryCount, stockAvailability }

  // setting cache memory
  myCache.set(key, JSON.stringify(pieCharts));
 }
 // give back the response
 return res.status(200).json({ success: true, pieCharts });
});

// to get admin bar chart stars
// route: stats/ba
// GET
// Private
export const getBarStats = TryCatch(async (req, res, next) => {
 let barCharts = {};
 const key = "admin-bar-charts";
 // check bar charts exists in cache memory
 if (myCache.has(key)) {
  barCharts = JSON.parse(myCache.get(key) as string);
 } else {
  // for calculating values six months ago
  const today = new Date();
  const sixMonthAgo = new Date();
  sixMonthAgo.setDate(sixMonthAgo.getMonth() - 6);
  // twelve months ago
  const twelveMonthAgo = new Date();
  twelveMonthAgo.setDate(twelveMonthAgo.getMonth() - 12);

  // creating promise that will find last six month products
  const sixMonthProductsPromise = ProductModel.find({
   createdAt: {
    $gte: sixMonthAgo,
    $lte: today
   }
  }).select("createdAt")
  // creating promise that will find last six month user
  const sixMonthUsersPromise = UserModel.find({
   createdAt: {
    $gte: sixMonthAgo,
    $lte: today
   }
  }).select("createdAt")
  // creating promise that will find last twelve month order
  const twelveMonthOrdersPromise = OrderModel.find({
   createdAt: {
    $gte: twelveMonthAgo,
    $lte: today
   }
  }).select("createdAt")
  // executing all the promises
  const [sixMonthProducts, sixMonthUsers, twelveMonthOrders] = await Promise.all([sixMonthProductsPromise, sixMonthUsersPromise, twelveMonthOrdersPromise])

  // get previous month status data
  const sixMonthProductsStats = previousMonthStats({ length: 6, docArr: sixMonthProducts });
  const sixMonthUsersStats = previousMonthStats({ length: 6, docArr: sixMonthUsers });
  const twelveMonthOrdersStats = previousMonthStats({ length: 12, docArr: twelveMonthOrders });

  // adding all stats in barCharts
  barCharts = {
   users: sixMonthUsersStats,
   products: sixMonthProductsStats,
   orders: twelveMonthOrdersStats
  }
  myCache.set(key, JSON.stringify(barCharts));
 }
 // storing in cache memory

 // giving back the bar chart stats
 return res.status(200).json({ success: true, barCharts });
});

// get admin line chart stats
// route: stats/line
// GET
// Private
export const getLineStats = TryCatch(async (req, res, next) => {
 let lineCharts = {};
 const key = "admin-line-charts";
 // check bar charts exists in cache memory
 if (myCache.has(key)) {
  lineCharts = JSON.parse(myCache.get(key) as string);
 } else {
  // for calculating values six months ago
  const today = new Date();
  // twelve months ago
  const twelveMonthAgo = new Date();
  twelveMonthAgo.setDate(twelveMonthAgo.getMonth() - 12);
  // base query
  const twelveMonthQuery = {
   createdAt: {
    $gte: twelveMonthAgo,
    $lte: today
   }
  }

  // creating promise that will find last twelve month order
  const twelveMonthOrdersPromise = OrderModel.find(twelveMonthQuery).select(["createdAt", "discount", "total"])
  // creating promise that will find last twelve month users
  const twelveMonthUsersPromise = UserModel.find(twelveMonthQuery).select("createdAt")
  // creating promise that will find last twelve month products
  const twelveMonthProductsPromise = ProductModel.find(twelveMonthQuery).select("createdAt")

  // executing all the promises
  const [twelveMonthProducts, twelveMonthUsers, twelveMonthOrders] = await Promise.all([twelveMonthProductsPromise, twelveMonthUsersPromise, twelveMonthOrdersPromise])

  // get previous month status data
  const twelveMonthProductsStats = previousMonthStats({ length: 12, docArr: twelveMonthProducts });
  const twelveMonthUsersStats = previousMonthStats({ length: 12, docArr: twelveMonthUsers });
  const twelveMonthOrdersStats = previousMonthStats({ length: 12, docArr: twelveMonthOrders });
  const twelveMonthDiscountStats = previousMonthStats({ length: 12, docArr: twelveMonthOrders, property: "discount" });
  const twelveMonthRevenueStats = previousMonthStats({ length: 12, docArr: twelveMonthOrders, property: "total" });

  // adding all stats in lineCharts
  lineCharts = {
   users: twelveMonthUsersStats,
   products: twelveMonthProductsStats,
   orders: twelveMonthOrdersStats,
   revenue: twelveMonthRevenueStats,
   discount: twelveMonthDiscountStats,
  }
  myCache.set(key, JSON.stringify(lineCharts));
 }
 // storing in cache memory

 // giving back the bar chart stats
 return res.status(200).json({ success: true, lineCharts });
});
