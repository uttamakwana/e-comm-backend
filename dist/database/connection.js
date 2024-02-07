import mongoose from 'mongoose';
//* it will establish the connection with MongoDB */
export const connectToDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
        const database = await mongoose.connect(mongoURI);
        console.log("******* Database Connection ********");
        console.log("Database name:", database.connection.name);
        console.log("Host name:", database.connection.host);
    }
    catch (error) {
        console.log(error);
    }
};
