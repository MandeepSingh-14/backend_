// require('dotenv').config({path: './env'})

import dotenv from "dotenv" 
import connectDB from "./db/index.js"
import { log } from "console"

dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running on port ${process.env.PORT}`);
        
    })
})
.catch(err ,() => {
    console.log("MONGO DB CONNECTION FAILED :",err);
    
})
