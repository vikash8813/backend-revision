// import mongoose from "mongoose";


// const connectDb = async () => {
//     console.log('running db connection');
//     console.log(process.env.DB_NAME);
//     const db = await mongoose.connect(`${process.env.DATABASE_URI}/${process.env.DB_NAME}`).then(r => {
//         console.log("Connected to MongoDB");
//     }).catch(err => {
//         console(err)
//     });
// }


// export {connectDb};

import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${process.env.DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export { connectDB}