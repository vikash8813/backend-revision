import { app } from "./app.js";
import 'dotenv/config'
import { connectDB } from "./src/db/index.js";


// console.log(process.env.DB_NAME);


connectDB().then(() => {
    app.listen(process.env.PORT,() =>{
        console.log('server started')
    })
}).catch((err) => {
    // console.log(err)
    // console.log('failed to listen',err)
})


