//* we are going to calculate the stats(number/values) of products, users, orders, revenue, and other things for year/months  */
export const previousMonthStats = ({ length, docArr, property }) => {
    const data = new Array(length).fill(0);
    const today = new Date();
    // console.log(lastSixMonthOrders);
    docArr.forEach(doc => {
        const creationDate = doc.createdAt;
        // we are adding 12 if we get diff minus and modulo 12 if get more then 12
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
        if (monthDiff < length) {
            // basically we are going to put data[4] = 10 if in may month the total products created is 10
            // if we have property coming from the props then we are going to add that property with it's value!
            data[length - monthDiff - 1] += property ? doc[property] : 1;
        }
    });
    return data;
};
