//DO CHEEZEIN ALWAYS REMEMBER WHILE WORKING WITH DB 
    //1. ALWAYS USE Try/Catch
    //2. ALWAYS USE Async/Await


import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () =>{
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONGODB Connected !! DB HOST : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGO DB connection failed" ,error);
        process.exit(1)
    }
} 


export default connectDB









// import mongoose from "mongoose";
// import { DB_NAME } from "./constant";






// import express from "express"
// const app = express()


// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//         app.on("error", (error)=>{
//             console.log("ERROR: ",error)
//             throw error
//         })

//         app.listen(process.env.PORT, ()=> {
//             console.log(`App is listening to por ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.error('ERROR: ',error)
//         throw err
//     }
// })